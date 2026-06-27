import { useEffect, useRef, useState } from 'react'

const IMAGES = [
  { src: '/assets/soueast-1.jpg', alt: 'Soueast S05 noir' },
  { src: '/assets/soueast-2.jpg', alt: 'Soueast S05 argent' },
  { src: '/assets/soueast-3.jpg', alt: 'Soueast S05 gris' },
  { src: '/assets/soueast-4.jpg', alt: 'Soueast S05 intérieur' },
  { src: '/assets/soueast-5.jpg', alt: 'Soueast S05 en conduite' },
]

export function CarCarousel() {
  const [idx, setIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (track) track.style.transform = `translateX(-${idx * 100}%)`
  }, [idx])

  const goto = (i: number) => setIdx(((i % IMAGES.length) + IMAGES.length) % IMAGES.length)
  const step = (dir: number) => goto(idx + dir)

  return (
    <div className="car-visual fade-up">
      <div className="carousel-outer">
        <div className="carousel-track" id="carousel-track" ref={trackRef}>
          {IMAGES.map((img) => (
            <div className="carousel-slide" key={img.src}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <button className="car-btn car-btn-prev" onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="car-btn car-btn-next" onClick={() => step(1)}>
          <svg viewBox="0 0 24 24">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
      <div className="carousel-dots" id="carousel-dots">
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className={`car-dot ${i === idx ? 'active' : ''}`}
            onClick={() => goto(i)}
          />
        ))}
      </div>
    </div>
  )
}
