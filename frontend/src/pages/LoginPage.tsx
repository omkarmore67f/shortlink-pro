import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link as LinkIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative gradient blobs for visual depth behind the glass card */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary-300/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-300/40 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm">
              <LinkIcon className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900">ShortLink Pro</span>
          </Link>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h1 className="text-xl font-bold text-gray-900 text-center">Welcome back</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Log in to manage your short links
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
