import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage({ mode = 'login' }) {
  const isLogin          = mode === 'login';
  const { login, register } = useAuth();
  const navigate         = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!isLogin && form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.match(/^\S+@\S+\.\S+$/))    e.email = 'Valid email required';
    if (form.password.length < 6)               e.password = 'Password must be 6+ characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow">
            <TrendingDown size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">SpendLens</span>
        </div>

        <div className="card p-7 shadow-xl">
          <h2 className="font-extrabold text-xl mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            {isLogin ? 'Sign in to continue tracking your expenses.' : 'Start tracking your expenses for free.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input
                  className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  type="text" placeholder="Harsh Yadav"
                  value={form.name} onChange={set('name')} autoComplete="name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-[var(--color-muted)]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-[var(--color-muted)] mt-4">
          Portfolio project by Harsh Yadav
        </p>
      </div>
    </div>
  );
}
