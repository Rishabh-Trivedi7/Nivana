import './WhyChooseNivana.css';

const REASONS = [
  {
    title: 'Curated, Not Crowdsourced',
    text: 'Every property is personally vetted for quality, authenticity, and experiential value — no algorithmic noise.',
  },
  {
    title: 'India-First Experiences',
    text: 'From Kumaon lodges to Kerala Ayurveda retreats — we specialize in meaningful travel across the Indian subcontinent.',
  },
  {
    title: 'Transparent Booking',
    text: 'Clear pricing, verified availability, and a straightforward booking process you can trust.',
  },
  {
    title: 'Traveller Community',
    text: 'Real reviews from guests who have completed their stays — honest feedback to guide your choices.',
  },
];

export default function WhyChooseNivana() {
  return (
    <section className="section why-nivana">
      <div className="container why-nivana__inner">
        <div className="why-nivana__content">
          <span className="section-label">Why Nivana</span>
          <h2 className="section-title">Travel with intention</h2>
          <p className="why-nivana__intro">
            We believe the best stays aren&apos;t found by scrolling endlessly — they&apos;re discovered through curation, storytelling, and a deep respect for place.
          </p>
        </div>
        <div className="why-nivana__reasons">
          {REASONS.map((reason) => (
            <div key={reason.title} className="why-card">
              <h3 className="why-card__title">{reason.title}</h3>
              <p className="why-card__text">{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
