import { TESTIMONIALS } from '../../constants/destinations.js';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Traveller Stories</h2>
        </div>

        <div className="grid-3 testimonials__grid">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="testimonial-card">
              <div className="testimonial-card__stars" aria-label={`${t.rating} out of 5 stars`}>
                {'★'.repeat(t.rating)}
              </div>
              <p className="testimonial-card__text">&ldquo;{t.text}&rdquo;</p>
              <footer className="testimonial-card__author">
                <strong>{t.name}</strong>
                <span>{t.location}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
