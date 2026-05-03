import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowRight } from '@phosphor-icons/react';
import { Navigate } from 'react-router-dom';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://chronyx.in';

function AuthPage({ user }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (user) {
    return <Navigate to="/account" replace />;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Successful login will trigger the auth state listener in App.jsx
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${SITE_URL}/auth`,
          },
        });
        if (error) throw error;
        
        // Auto-subscribe new users to newsletter
        await supabase.from('subscribers').insert([{ email, source: 'signup' }]);
        
        setMessage({ text: 'Check your email for the confirmation link!', type: 'success' });
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: 'var(--surface-2)', borderRadius: '24px', border: '1px solid var(--line)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {isLogin ? 'Sign in to access your orders and saved items.' : 'Join CHRONYX to track orders and save favorites.'}
        </p>

        {message.text && (
          <div style={{ padding: '12px', background: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: '8px' }}
            />
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', padding: '14px' }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage({ text: '', type: '' }); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
