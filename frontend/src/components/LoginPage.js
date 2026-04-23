import { useState } from 'react';
import { signInWithGoogle } from '../services/auth.service';

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    const { error: signInError } = await signInWithGoogle();

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-branding">
          <span className="eyebrow">Welcome back</span>
          <h1>Tasks App</h1>
          <p>Sign in with Google to manage your tasks across devices.</p>
        </div>

        <button type="button" className="button button-primary" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && <div className="error-panel">{error}</div>}
      </div>
    </div>
  );
}
