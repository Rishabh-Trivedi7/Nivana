import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';
import './CTASection.css';

export default function CTASection() {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <h2 className="cta__title">Ready for your next escape?</h2>
        <p className="cta__text">
          Browse our curated collection and find a stay that resonates with how you want to travel.
        </p>
        <div className="cta__actions">
          <Link to="/properties">
            <Button size="lg" variant="secondary">Explore Stays</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="cta__btn-outline">Create Account</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
