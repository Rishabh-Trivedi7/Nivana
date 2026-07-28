import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
