import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, User, Phone, Building } from 'lucide-react';
import SetupDiagnostics from '../components/SetupDiagnostics';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    organization: ''
  });
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isSignUp
      ? await signUpWithEmail(formData.email, formData.password)
      : await signInWithEmail(formData.email, formData.password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error);
    }

    setGoogleLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      organization: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-3 mb-2">
            <img
              src="/coaching-logo.svg"
              alt="Coaching Hub"
              width={80}
              height={80}
              className="rounded-2xl shadow-xl ring-2 ring-gray-200"
            />
            <h1 className="text-4xl font-bold text-gray-900">Coaching Hub</h1>
          </div>
          <p className="text-gray-600 text-lg">Modern Management System</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <SetupDiagnostics />
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isSignUp ? 'Join our coaching management platform' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative min-h-[2.75rem]">
                    <span className="pointer-events-none absolute left-0 top-0 flex h-full w-11 items-center justify-center text-gray-400">
                      <User size={20} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field-with-icon"
                      placeholder="Enter your full name"
                      required={isSignUp}
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative min-h-[2.75rem]">
                    <span className="pointer-events-none absolute left-0 top-0 flex h-full w-11 items-center justify-center text-gray-400">
                      <Phone size={20} />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field-with-icon"
                      placeholder="Enter your phone number"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization (Optional)</label>
                  <div className="relative min-h-[2.75rem]">
                    <span className="pointer-events-none absolute left-0 top-0 flex h-full w-11 items-center justify-center text-gray-400">
                      <Building size={20} />
                    </span>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="input-field-with-icon"
                      placeholder="School or coaching center name"
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative min-h-[2.75rem]">
                <span className="pointer-events-none absolute left-0 top-0 flex h-full w-11 items-center justify-center text-gray-400">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field-with-icon"
                  placeholder="your@email.com"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative min-h-[2.75rem]">
                <span className="pointer-events-none absolute left-0 top-0 flex h-full w-11 items-center justify-center text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field-with-icon pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading || googleLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  disabled={loading || googleLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Divider + Google */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
            <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white py-3.5 pl-4 pr-4 text-[15px] font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:border-gray-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-slate-50/80 to-white opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-3">
              {googleLoading ? (
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                  Connecting to Google…
                </span>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </span>
          </button>

          {/* Toggle Mode */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-primary hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
              disabled={loading || googleLoading}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Coaching Hub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
