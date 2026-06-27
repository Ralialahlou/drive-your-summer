# Drive Your Summer — Backend Spec (Django module)

A self-contained Django app, **`dys`** (Drive Your Summer), that plugs into your
existing Django project. It powers participant registration, login, receipt
upload + manual review, progress/leaderboard, and PIN reset for the Morocco Mall
contest (6–27 July 2026, prize: Soueast S05, 300 000 MAD).

---

## 1. Decisions (locked)

| Topic | Decision |
|---|---|
| **Auth** | Phone + 4-digit PIN. PIN is hashed. Login returns a **DRF opaque token** (`Authorization: Token <token>`). No JWT, no refresh rotation. |
| **Receipt validation** | **Manual admin approval.** Every receipt is created `pending`. Only `approved` receipts count toward a participant's total and the leaderboard. Staff review the photo + amount in Django admin. |
| **Identity** | Phone trusted as-is (no SMS/OTP). **One account per phone** (DB-unique). Fraud caught at receipt review. |
| **PIN reset** | Phone-based. A 6-digit reset code is generated server-side, valid 5 min, single-use. (Delivery via SMS/email is a future hook; for now the code is returned/visible to staff — see §6.4.) |
| **Money** | Amounts in MAD, stored as `Decimal(10,2)`. Minimum eligible receipt: **1 000 MAD**. |
| **i18n** | API is language-agnostic; the React app holds FR/AR copy. Error responses use stable string `code`s the frontend maps to localized text. |

---

## 2. Integration into the existing project

```
your_project/
├── manage.py
├── your_project/
│   ├── settings.py        # add 'rest_framework', 'rest_framework.authtoken', 'dys'
│   └── urls.py            # include('dys.urls') under /api/dys/
└── dys/                   # ← NEW app (this spec)
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    ├── admin.py
    ├── permissions.py
    ├── selectors.py       # total/level/rank query helpers
    └── migrations/
```

**settings.py additions**

```python
INSTALLED_APPS += [
    "rest_framework",
    "rest_framework.authtoken",
    "dys",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "register": "10/hour",
        "login": "20/hour",
        "reset": "5/hour",
        "upload": "60/hour",
    },
}

# Receipt images. Use object storage (S3/GCS) in prod via django-storages.
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DYS_RECEIPT_MAX_MB = 10
DYS_MIN_RECEIPT_AMOUNT = 1000  # MAD
DYS_CAMPAIGN_START = "2026-07-06T00:00:00+01:00"
DYS_CAMPAIGN_END = "2026-07-27T23:59:59+01:00"
DYS_FINALIST_COUNT = 20
```

**your_project/urls.py**

```python
urlpatterns += [path("api/dys/", include("dys.urls"))]
```

All endpoints below are therefore prefixed with **`/api/dys/`**.

---

## 3. Data models

### 3.1 `Participant`

The contest account. Not Django's `auth.User` (no username/email-login
collision with your existing project); a standalone model keyed by phone.

| Field | Type | Notes |
|---|---|---|
| `id` | BigAuto PK | |
| `first_name` | CharField(80) | required |
| `last_name` | CharField(80) | required |
| `phone` | CharField(20), **unique** | normalized: strip spaces, store E.164-ish (`+2126…`) |
| `email` | EmailField | optional |
| `pin` | CharField(128) | **hashed** via `django.contrib.auth.hashers.make_password` |
| `is_active` | Bool, default True | admin can disable a cheater |
| `created_at` | DateTimeField(auto_now_add) | |

- `set_pin(raw)` / `check_pin(raw)` wrap `make_password` / `check_password`.
- Auth token: one `rest_framework.authtoken.models.Token` per participant via a
  small adapter (Token's FK points at `settings.AUTH_USER_MODEL` by default, so
  either (a) make `Participant` a custom user model, or (b) use a dedicated
  `ParticipantToken` model — see §3.4). **Recommended: (b)**, keeps your project's
  existing `auth.User`/admin untouched.

### 3.2 `Receipt`

| Field | Type | Notes |
|---|---|---|
| `id` | BigAuto PK | |
| `participant` | FK → Participant, `related_name="receipts"` | |
| `amount` | Decimal(10,2) | ≥ `DYS_MIN_RECEIPT_AMOUNT` |
| `image` | ImageField(upload_to="receipts/%Y/%m/") | the ticket photo |
| `status` | CharField choices: `pending` / `approved` / `rejected` | default `pending` |
| `reject_reason` | CharField(200), blank | shown to participant when rejected |
| `reviewed_by` | FK → auth.User, null | staff who reviewed |
| `reviewed_at` | DateTimeField, null | |
| `created_at` | DateTimeField(auto_now_add) | |

- Index on `(participant, status)` and `(status, created_at)`.
- **Only `status="approved"` counts** toward totals/leaderboard.

### 3.3 `PinResetCode`

| Field | Type | Notes |
|---|---|---|
| `participant` | FK → Participant | |
| `code` | CharField(6) | 6 digits |
| `expires_at` | DateTimeField | now + 5 min |
| `used` | Bool default False | single-use |
| `created_at` | DateTimeField(auto_now_add) | |

### 3.4 `ParticipantToken` (auth)

`token` (CharField(40) unique, hex), `participant` OneToOne, `created_at`.
Issued on register/login. Sent as `Authorization: Token <token>`. A custom DRF
`TokenAuthentication` subclass resolves it to a `Participant` and sets
`request.user = participant` (duck-typed: `.is_authenticated = True`).

---

## 4. Derived values (selectors.py)

Pure query helpers, reused by serializers and the leaderboard:

- `participant_total(p) -> Decimal` — sum of `approved` receipt amounts.
- `participant_level(total) -> {index, name, name_ar, emoji, min, max} | null`
  — mirrors the 12-tier `LEVELS` ladder in the React app
  (`src/constants.ts`). **Single source of truth lives in the backend**; expose
  via `GET /levels` so the frontend can drop its hardcoded copy.
- `participant_rank(p) -> int` — 1-based position by approved total (ties broken
  by earliest `created_at` of the participant).
- `leaderboard(limit=20) -> [...]` — top N by approved total.

---

## 5. Conventions

- **Base path:** `/api/dys/`
- **Auth header:** `Authorization: Token <token>` (omit on public endpoints).
- **Content types:** JSON everywhere **except** receipt upload (multipart/form-data).
- **Errors:** non-2xx returns
  ```json
  { "error": { "code": "STABLE_CODE", "message": "Human readable (FR default)", "fields": { "phone": ["…"] } } }
  ```
  `code` is stable and frontend-mapped; `fields` present only on 400 validation.
- **Money** serialized as string (`"1500.00"`) to avoid float drift.
- **Datetimes** ISO 8601 with offset.
- **Throttling** per §2 scopes.

### Standard error codes
`VALIDATION` (400) · `INVALID_CREDENTIALS` (401) · `AUTH_REQUIRED` (401) ·
`PHONE_TAKEN` (409) · `PHONE_NOT_FOUND` (404) · `PIN_TOO_SHORT` (400) ·
`RESET_CODE_INVALID` (400) · `RESET_CODE_EXPIRED` (400) · `AMOUNT_TOO_LOW` (400) ·
`IMAGE_REQUIRED` (400) · `IMAGE_TOO_LARGE` (400) · `IMAGE_BAD_TYPE` (400) ·
`CAMPAIGN_CLOSED` (403) · `ACCOUNT_DISABLED` (403) · `THROTTLED` (429).

---

## 6. Endpoints

> Maps directly onto the React store actions in `src/store.tsx`
> (`register`, `login`, `addReceipt`, dashboard total/level, receipts list, PIN reset).

### 6.1 `POST /register` — create account (public)

Mirrors `submitRegister`. Creates the participant and logs them in (returns token).

**Throttle:** `register`. **Auth:** none.

**Request (JSON)**
```json
{
  "first_name": "Karim",
  "last_name": "Benali",
  "phone": "+212 6 12 34 56 78",
  "email": "karim@exemple.ma",
  "pin": "1234"
}
```
Rules: `first_name`/`last_name`/`phone` required; `pin` exactly 4 digits;
`phone` normalized + must be unique; `email` optional but validated if present.

**201 Created**
```json
{
  "token": "9c8b…",
  "participant": {
    "id": 42, "first_name": "Karim", "last_name": "Benali",
    "phone": "+212612345678", "email": "karim@exemple.ma",
    "created_at": "2026-07-08T14:03:00+01:00"
  }
}
```
**Errors:** `PHONE_TAKEN` (409), `PIN_TOO_SHORT` (400), `VALIDATION` (400),
`CAMPAIGN_CLOSED` (403, if registration disabled after end).

---

### 6.2 `POST /login` — authenticate (public)

Mirrors `submitLogin`. Phone + PIN → token.

**Throttle:** `login`. **Auth:** none.

**Request**
```json
{ "phone": "+212612345678", "pin": "1234" }
```

**200 OK** — same shape as register (`{ token, participant }`).

**Errors:** `PHONE_NOT_FOUND` (404), `INVALID_CREDENTIALS` (401),
`ACCOUNT_DISABLED` (403).
> Security note: to avoid phone enumeration you *may* collapse `PHONE_NOT_FOUND`
> and wrong-PIN into a single `INVALID_CREDENTIALS` (401). Current frontend shows
> distinct messages ("Numéro introuvable" vs "Code incorrect"); keep distinct
> only if that UX is required.

---

### 6.3 `POST /logout` — invalidate token (auth)

Deletes the caller's `ParticipantToken`. **204 No Content.**

---

### 6.4 PIN reset (public, 2-step) — mirrors `sendResetCode` / `confirmResetPin`

**`POST /pin/reset/request`**

**Throttle:** `reset`.
```json
{ "phone": "+212612345678" }
```
Generates a 6-digit single-use code (expires 5 min), invalidates prior unused
codes for that phone.

**200 OK**
```json
{ "sent": true, "expires_in": 300 }
```
> The code is **not** returned in the response in production. Delivery hook:
> `dys.notifications.send_reset_code(participant, code)` — wire to SMS/email
> later. For staging, surface the code in Django admin (`PinResetCode` list) or
> behind a `DEBUG`-only field `"debug_code"`.

**Errors:** `PHONE_NOT_FOUND` (404) — or silently `200` to avoid enumeration
(recommended; frontend already proceeds to step 2 either way).

**`POST /pin/reset/confirm`**
```json
{ "phone": "+212612345678", "code": "482915", "new_pin": "5678" }
```
Validates code (exists, not used, not expired, matches phone) and `new_pin`
(4 digits). On success: re-hash PIN, mark code used, **invalidate existing
tokens** (force re-login).

**200 OK** `{ "reset": true }`

**Errors:** `RESET_CODE_INVALID` (400), `RESET_CODE_EXPIRED` (400),
`PIN_TOO_SHORT` (400).

---

### 6.5 `GET /me` — current participant + progress (auth)

Powers the dashboard (`userTotal`, `userLevel`, greeting, rank).

**200 OK**
```json
{
  "id": 42, "first_name": "Karim", "last_name": "Benali",
  "phone": "+212612345678", "email": "karim@exemple.ma",
  "total": "12500.00",
  "receipt_count": 3,
  "approved_count": 2,
  "pending_count": 1,
  "level": { "index": 2, "name": "Grand Pilote", "name_ar": "سائق متمرس",
             "emoji": "🏎️", "min": "10000.00", "max": "20000.00" },
  "rank": 7,
  "finalist_cutoff": 20
}
```
`level` is `null` when `total` < first tier (1 000). `total` counts **approved
only**; `pending_count` lets the UI show "1 ticket en cours de validation".

---

### 6.6 `POST /receipts` — submit a ticket (auth, multipart)

Mirrors `submitUpload`. Creates a `pending` receipt.

**Throttle:** `upload`. **Content-Type:** `multipart/form-data`.

**Request (form fields)**
| field | type | rules |
|---|---|---|
| `amount` | decimal string | ≥ 1000 |
| `image` | file | JPEG/PNG/WebP/HEIC, ≤ `DYS_RECEIPT_MAX_MB` |

**201 Created**
```json
{
  "id": 1007,
  "amount": "1500.00",
  "image_url": "https://…/media/receipts/2026/07/abc.jpg",
  "status": "pending",
  "created_at": "2026-07-08T14:10:00+01:00"
}
```
> Note vs. legacy frontend: the old app counted the amount instantly. Now the
> receipt is `pending` and **does not** raise `total` until approved. The React
> success screen copy should change to "en cours de validation". `GET /me`
> reflects it via `pending_count`.

**Errors:** `AMOUNT_TOO_LOW` (400), `IMAGE_REQUIRED` (400),
`IMAGE_TOO_LARGE` (400), `IMAGE_BAD_TYPE` (400), `CAMPAIGN_CLOSED` (403),
`ACCOUNT_DISABLED` (403).

---

### 6.7 `GET /receipts` — my tickets (auth)

Mirrors `renderReceipts`. Newest first.

**Query:** `?status=pending|approved|rejected` (optional filter),
`?page=` (paginated, 20/page).

**200 OK**
```json
{
  "count": 3,
  "total_approved": "12500.00",
  "results": [
    { "id": 1007, "amount": "1500.00",
      "image_url": "https://…/receipts/2026/07/abc.jpg",
      "status": "pending", "reject_reason": "",
      "created_at": "2026-07-08T14:10:00+01:00" },
    { "id": 1003, "amount": "11000.00", "image_url": "…",
      "status": "approved", "created_at": "2026-07-07T18:22:00+01:00" }
  ]
}
```

---

### 6.8 `GET /levels` — the tier ladder (public)

Lets the frontend drop its hardcoded `LEVELS` and stay in sync.

**200 OK**
```json
{
  "min_amount": "1000.00",
  "levels": [
    { "index": 0, "name": "Co-Pilote",  "name_ar": "مساعد سائق", "emoji": "🏁", "min": "1000.00",  "max": "5000.00" },
    { "index": 1, "name": "Pilote",     "name_ar": "سائق",       "emoji": "🚗", "min": "5000.00",  "max": "10000.00" },
    "… 12 tiers total, ending Légende (min 100000, max null) …"
  ]
}
```

---

### 6.9 `GET /leaderboard` — Top N (public or auth)

Optional, for a "classement" view. Privacy: expose **masked** names only.

**200 OK**
```json
{
  "finalist_count": 20,
  "results": [
    { "rank": 1, "name": "Karim B.", "total": "48000.00" },
    { "rank": 2, "name": "Sara M.",  "total": "41000.00" }
  ],
  "me": { "rank": 7, "total": "12500.00", "in_finalists": false }
}
```
`me` present only when authenticated.

---

## 7. Admin (the review workflow)

`dys/admin.py` — this is where staff run the contest.

- **ParticipantAdmin:** list `phone, full name, total (approved), rank,
  receipt counts, is_active`; search by phone/name; action **"Disable account"**.
- **ReceiptAdmin:** the core screen.
  - List: `id, participant, amount, status, created_at`, **image thumbnail**.
  - Filters: `status`, `created_at`.
  - **Bulk actions:** `approve_selected`, `reject_selected` (prompts for a
    `reject_reason`). Both stamp `reviewed_by=request.user` + `reviewed_at=now`.
  - Approving/rejecting recomputes totals on read (no denormalized counter, or
    add one with a signal if leaderboard perf needs it).
- **Winner selection:** a custom admin view / management command
  `python manage.py dys_finalists` → exports the top 20 by approved total to CSV
  (name, phone, email, total, receipt count) for the draw.

---

## 8. Validation & security details

- **PIN:** exactly 4 digits, hashed (`make_password`). Never returned. Throttle
  login to blunt brute-force (10 000 combos); consider lockout after N fails.
- **Phone normalization:** strip spaces/dashes; store canonical form; uniqueness
  check on canonical form (matches the frontend's `replace(/\s/g,'')`).
- **Image:** validate content-type AND magic bytes (Pillow `verify()`), cap size,
  strip EXIF on save (privacy), randomize filename (uuid) to prevent guessing.
  Serve via signed URLs if using private S3.
- **Campaign window:** `register` and `receipts` reject with `CAMPAIGN_CLOSED`
  outside `[DYS_CAMPAIGN_START, DYS_CAMPAIGN_END]` (configurable; allow register
  slightly before start if desired).
- **CORS:** add `django-cors-headers`, allow the React origin(s)
  (localhost:5173 dev, the Pages/Vercel domain in prod).
- **Rate limits:** per §2 scopes.

---

## 9. Frontend changes implied (for the React app)

When this backend lands, the React app's `src/store.tsx` swaps localStorage for
`fetch` calls. Concretely:

| Store action | Replaced by |
|---|---|
| `register()` | `POST /register` → save `token` (localStorage) + participant |
| `login()` | `POST /login` |
| `logout()` | `POST /logout` + clear token |
| `addReceipt()` | `POST /receipts` (multipart). Success copy → "en cours de validation" |
| `userTotal` / `userLevel` | from `GET /me` (approved-only). Show `pending_count` |
| receipts list | `GET /receipts` |
| forgot-PIN 2-step | `POST /pin/reset/request` + `/pin/reset/confirm` |
| `LEVELS` constant | optional: fetch `GET /levels` to stay in sync |

Keep a thin `api.ts` client that injects `Authorization: Token` and maps `error.code`
to the existing FR/AR toast strings.

---

## 10. Build order (suggested)

1. Models + migrations + admin (Participant, Receipt, PinResetCode, ParticipantToken).
2. Auth: register / login / logout / `/me`. Wire token auth class.
3. Receipts: upload + list. Admin approve/reject actions.
4. Selectors: total / level / rank. `/levels`, `/leaderboard`.
5. PIN reset (request/confirm) + notification stub.
6. Throttling, CORS, image hardening, campaign-window guard.
7. `dys_finalists` export command.
8. Point the React app at the API (§9).

---

## 11. Endpoint cheat-sheet

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/dys/register` | – | Create account, return token |
| POST | `/api/dys/login` | – | Phone+PIN → token |
| POST | `/api/dys/logout` | ✓ | Invalidate token |
| POST | `/api/dys/pin/reset/request` | – | Send 6-digit reset code |
| POST | `/api/dys/pin/reset/confirm` | – | Verify code, set new PIN |
| GET | `/api/dys/me` | ✓ | Profile + total + level + rank |
| POST | `/api/dys/receipts` | ✓ | Submit ticket (multipart) → pending |
| GET | `/api/dys/receipts` | ✓ | My tickets (filter by status) |
| GET | `/api/dys/levels` | – | Tier ladder (12 levels) |
| GET | `/api/dys/leaderboard` | –/✓ | Top 20 + my rank |
