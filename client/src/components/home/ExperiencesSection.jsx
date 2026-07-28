import { EXPERIENCES } from '../../constants/destinations.js';
import './ExperiencesSection.css';

export default function ExperiencesSection() {
  return (
    <section className="section experiences">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Experiences</span>
          <h2 className="section-title">More Than a Stay</h2>
          <p className="section-subtitle">
            Every property on Nivana offers a distinct experience — rooted in place, culture, and mindful travel.
          </p>
        </div>

        <div className="grid-4 experiences__grid">
          {EXPERIENCES.map((exp) => (
            <div key={exp.title} className="experience-card">
              <span className="experience-card__icon" aria-hidden="true">{exp.icon}</span>
              <h3 className="experience-card__title">{exp.title}</h3>
              <p className="experience-card__text">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
