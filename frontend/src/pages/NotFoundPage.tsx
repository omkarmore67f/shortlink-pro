import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="glass-strong rounded-2xl px-10 py-12">
        <h1 className="text-6xl font-extrabold text-primary-600">404</h1>
        <p className="mt-4 text-lg font-semibold text-gray-900">Page not found</p>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
