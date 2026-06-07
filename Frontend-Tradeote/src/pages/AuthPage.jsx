import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Tabs, Tab, TextField, Button,
  Typography, Alert, Divider, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── GRID BACKGROUND ───────────────────────────────
const GridBg = () => (
  <Box sx={{
    position: 'fixed', inset: 0, zIndex: 0,
    background: '#0d0f14',
    backgroundImage: `
      linear-gradient(rgba(38,217,130,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(38,217,130,0.045) 1px, transparent 1px)
    `,
    backgroundSize: '36px 36px',
  }} />
);

// ── LEFT BRANDED PANEL (desktop only) ────────────
const LeftPanel = () => (
  <Box sx={{
    width: '42%',
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#13161f',
    borderRight: '1px solid #1c2030',
    p: '40px 32px',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  }}>
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(38,217,130,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(38,217,130,0.05) 1px, transparent 1px)
      `,
      backgroundSize: '28px 28px',
    }} />
    <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
        <Box sx={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #26d982, #c8a96e)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(38,217,130,0.25)',
        }}>
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <polyline points="1,11 4,7 7,9 10,4 13,2"
              stroke="#0d0f14" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
        <Typography sx={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 700, fontSize: 20,
          letterSpacing: '3px', color: '#e2e8f0',
        }}>
          TRADE<span style={{ color: '#c8a96e' }}>NOTE</span>
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 11, color: '#4a5568', letterSpacing: '1px', mb: 4 }}>
        Professional trading journal
      </Typography>

      {/* Mini chart */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: 72, justifyContent: 'center', mb: 0.5 }}>
          {[
            { h: 28, p: false }, { h: 44, p: true  }, { h: 20, p: false },
            { h: 58, p: true  }, { h: 48, p: true  }, { h: 14, p: false },
            { h: 64, p: true  }, { h: 50, p: true  }, { h: 34, p: true  },
            { h: 18, p: false }, { h: 55, p: true  }, { h: 68, p: true  },
          ].map((bar, i) => (
            <Box key={i} sx={{
              width: 14, height: bar.h,
              background: bar.p ? '#26d982' : '#ff5252',
              borderRadius: '3px 3px 0 0', opacity: 0.8,
            }} />
          ))}
        </Box>
        <Box sx={{ borderTop: '1px solid #1c2030' }} />
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 3.5, mb: 3.5 }}>
        {[
          { val: '24,891', lbl: 'TRADES LOGGED' },
          { val: '61.4%',  lbl: 'AVG WIN RATE'  },
          { val: '3,200+', lbl: 'USERS'          },
        ].map(({ val, lbl }) => (
          <Box key={lbl} sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: "'Orbitron', monospace", color: '#26d982', fontSize: 14, fontWeight: 700 }}>
              {val}
            </Typography>
            <Typography sx={{ color: '#2e3f58', fontSize: 8, letterSpacing: '1px', mt: 0.3 }}>
              {lbl}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Quote */}
      <Box sx={{
        width: '100%', p: '12px 16px',
        border: '1px solid #1c2030', borderRadius: '10px',
        background: 'rgba(38,217,130,0.03)',
      }}>
        <Typography sx={{ fontSize: 10, color: '#4a5568', lineHeight: 1.7, textAlign: 'center' }}>
          Track every trade. Review every day.{' '}
          <span style={{ color: '#26d982' }}>Know your edge.</span>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// ── LOGIN FORM ────────────────────────────────────
const LoginForm = ({ onForgotPassword, onLoginSuccess }) => {
  const { login }             = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.email && !form.password) { setError('Please fill in all details'); return; }
    if (!form.email)    { setError('Email is required'); return; }
    if (!form.password) { setError('Password is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.success) {
        login(
          { firstName: res.data.data.firstName, lastName: res.data.data.lastName, email: res.data.data.email },
          res.data.data.token
        );
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError(res.data.message || 'Invalid email or password');
      }
    } catch (err) {
      let msg = 'Login failed. Please try again.';
      if (err.response?.status === 401)     msg = 'Invalid email or password';
      else if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.error)   msg = err.response.data.error;
      else if (err.response?.statusText)    msg = err.response.statusText;
      else if (err.message)                 msg = err.message;
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <Box sx={{ p: { xs: '22px 20px 18px', md: '26px 26px 22px' } }}>
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: 11 }}>{error}</Alert>}
      <TextField
        fullWidth label="Email Address" name="email" type="email"
        value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
        error={(!form.email && !!error) || (!!form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))}
        helperText={
          !form.email && error ? 'Email is required' :
          form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'Invalid email format' : ''
        }
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth label="Password" name="password" type="password"
        value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
        error={(!form.password && !!error) || (!!form.password && form.password.length < 6)}
        helperText={
          !form.password && error ? 'Password is required' :
          form.password && form.password.length < 6 ? 'Minimum 6 characters' : ''
        }
        sx={{ mb: 1 }}
      />
      <Box sx={{ textAlign: 'right', mb: 2.5 }}>
        <Typography
          onClick={onForgotPassword}
          sx={{ fontSize: 11, color: '#c8a96e', cursor: 'pointer', letterSpacing: '0.5px', '&:hover': { textDecoration: 'underline' } }}
        >
          Forgot Password?
        </Typography>
      </Box>
      <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={20} sx={{ color: '#0d0f14' }} /> : 'LOGIN →'}
      </Button>
    </Box>
  );
};

// ── REGISTER FORM ─────────────────────────────────
const RegisterForm = ({ onRegistered }) => {
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const handleSubmit = async () => {
    if (!form.firstName && !form.lastName && !form.email && !form.password && !form.confirmPassword) { setError('Please fill in all fields'); return; }
    if (!form.firstName)       { setError('First name is required'); return; }
    if (!form.lastName)        { setError('Last name is required'); return; }
    if (!form.email)           { setError('Email is required'); return; }
    if (!form.password)        { setError('Password is required'); return; }
    if (!form.confirmPassword) { setError('Please confirm your password'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    if (form.password.length < 6)              { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
      });
      if (res.data.success) {
        setError('');
        setSuccess('Account created successfully. Redirecting to login...');
        setTimeout(() => { if (onRegistered) onRegistered(); navigate('/login'); }, 1800);
      } else {
        setError(res.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: { xs: '22px 20px 18px', md: '26px 26px 22px' } }}>
      {error   && <Alert severity="error"   sx={{ mb: 2, fontSize: 11 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, fontSize: 11 }}>{success}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <TextField
          fullWidth label="First Name" name="firstName" value={form.firstName} onChange={handleChange}
          error={!form.firstName && !!error} helperText={!form.firstName && error ? 'First name is required' : ''}
        />
        <TextField
          fullWidth label="Last Name" name="lastName" value={form.lastName} onChange={handleChange}
          error={!form.lastName && !!error} helperText={!form.lastName && error ? 'Last name is required' : ''}
        />
      </Box>
      <TextField
        fullWidth label="Email Address" name="email" type="email"
        value={form.email} onChange={handleChange}
        error={(!form.email && !!error) || (!!form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))}
        helperText={
          !form.email && error ? 'Email is required' :
          form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'Invalid email format' : ''
        }
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
        <TextField
          fullWidth label="Password" name="password" type="password"
          value={form.password} onChange={handleChange}
          error={(!form.password && !!error) || (!!form.password && form.password.length < 6)}
          helperText={!form.password && error ? 'Password is required' : form.password && form.password.length < 6 ? 'Minimum 6 characters' : ''}
        />
        <TextField
          fullWidth label="Confirm Password" name="confirmPassword" type="password"
          value={form.confirmPassword} onChange={handleChange}
          error={(!form.confirmPassword && !!error) || (!!form.confirmPassword && form.password !== form.confirmPassword)}
          helperText={!form.confirmPassword && error ? 'Please confirm password' : form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : ''}
        />
      </Box>
      <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress size={20} sx={{ color: '#0d0f14' }} /> : 'CREATE ACCOUNT →'}
      </Button>
    </Box>
  );
};

// ── SHARED FORM CARD FOOTER ───────────────────────
const FormFooter = ({ tab, setTab }) => (
  <Box sx={{ pb: 2.5, textAlign: 'center' }}>
    <Divider sx={{ mb: 2, mx: { xs: 2.5, md: 3 } }}>
      <Typography sx={{ fontSize: 10, color: '#2e3f58', px: 1 }}>OR</Typography>
    </Divider>
    {tab === 0 ? (
      <Typography sx={{ fontSize: 11, color: '#4a5568' }}>
        Don't have an account?{' '}
        <span onClick={() => setTab(1)} style={{ color: '#26d982', cursor: 'pointer' }}>Register here</span>
      </Typography>
    ) : (
      <Typography sx={{ fontSize: 11, color: '#4a5568' }}>
        Already have an account?{' '}
        <span onClick={() => setTab(0)} style={{ color: '#26d982', cursor: 'pointer' }}>Login here</span>
      </Typography>
    )}
  </Box>
);

// ── WELCOME MODAL ─────────────────────────────────
const WelcomeModal = ({ firstName, onProceed }) => (
  <Box sx={{
    position: 'fixed', inset: 0, zIndex: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(13,15,20,0.85)',
    px: 2,
  }}>
    <Paper elevation={12} sx={{
      width: '100%', maxWidth: 480,
      borderRadius: '22px',
      p: { xs: 4, md: 5 },
      background: '#13161f',
      border: '1px solid rgba(38,217,130,0.15)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    }}>
      {/* Logo mark */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
        <Box sx={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #26d982, #c8a96e)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <polyline points="1,11 4,7 7,9 10,4 13,2"
              stroke="#0d0f14" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
        <Typography sx={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 13, letterSpacing: '2px', color: '#e2e8f0' }}>
          TRADE<span style={{ color: '#c8a96e' }}>NOTE</span>
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: "'Orbitron', monospace",
        fontSize: { xs: 18, md: 22 }, fontWeight: 700,
        color: '#e2e8f0', mb: 1,
      }}>
        Welcome, {firstName || 'Trader'}.
      </Typography>

      <Typography sx={{ fontSize: 13, color: '#4a5568', mb: 3, lineHeight: 1.7 }}>
        Your trading workspace is ready.{' '}
        <span style={{ color: '#c8a96e' }}>Start tracking your trades</span>{' '}
        and review your performance every day.
      </Typography>

      <Box sx={{ borderTop: '1px solid #1c2030', mb: 2.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onProceed}
          sx={{ px: 4, py: 1.2, fontWeight: 700, fontSize: 12, letterSpacing: '1px' }}
        >
          PROCEED →
        </Button>
      </Box>
    </Paper>
  </Box>
);

// ── MAIN AUTH PAGE ────────────────────────────────
const AuthPage = () => {
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [tab, setTab] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // ── Ref to track if the current session came from a fresh login.
  //    When true, the useEffect redirect is suppressed so the
  //    welcome modal can show without immediately navigating away.
  const justLoggedIn = useRef(false);

  // ── Redirect already-authenticated users (e.g. page refresh
  //    while still logged in). Skipped when justLoggedIn is set
  //    so the welcome modal isn't bypassed.
  useEffect(() => {
    if (user && !justLoggedIn.current) {
      navigate('/calendar', { replace: true });
    }
  }, [user, navigate]);

  // ── Called by LoginForm on successful API response
  const handleLoginSuccess = () => {
    justLoggedIn.current = true;  // block the useEffect redirect
    setShowWelcome(true);
  };

  // ── Called by the PROCEED button in the welcome modal
  const handleProceed = () => {
    // Navigate first — no state update means no extra re-render
    // that could briefly reveal the auth page before leaving.
    navigate('/calendar', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <GridBg />

      {/* ════ DESKTOP ════ */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative', zIndex: 1,
        py: 4,
      }}>
        <Paper elevation={8} sx={{
          width: '100%', maxWidth: 840,
          borderRadius: '18px', overflow: 'hidden',
          display: 'flex', flexDirection: 'row',
          minHeight: 500,
          border: '1px solid #1c2030',
        }}>
          <LeftPanel />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0f14' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 0 }}>
              <Typography sx={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 13, fontWeight: 700,
                color: '#e2e8f0', letterSpacing: '1px', mb: 0.3,
              }}>
                WELCOME BACK
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#4a5568', mb: 1 }}>
                Sign in to your account
              </Typography>
            </Box>
            <Tabs
              value={tab} onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: '1px solid #1c2030' }}
            >
              <Tab label="LOGIN" />
              <Tab label="REGISTER" />
            </Tabs>
            <Box sx={{ flex: 1 }}>
              {tab === 0 && (
                <LoginForm
                  onForgotPassword={() => navigate('/forgot-password')}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
              {tab === 1 && <RegisterForm onRegistered={() => setTab(0)} />}
            </Box>
            <FormFooter tab={tab} setTab={setTab} />
          </Box>
        </Paper>

        {/* Stats strip */}
        <Box sx={{ display: 'flex', gap: 4.5, mt: 3 }}>
          {[
            { val: '24,891', lbl: 'TRADES LOGGED' },
            { val: '61.4%',  lbl: 'AVG WIN RATE'  },
            { val: '3,200+', lbl: 'USERS'          },
          ].map(({ val, lbl }) => (
            <Box key={lbl} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: "'Orbitron', monospace", color: '#26d982', fontSize: 15, fontWeight: 700 }}>
                {val}
              </Typography>
              <Typography sx={{ color: '#2e3f58', fontSize: 9, letterSpacing: '1px', mt: 0.3 }}>
                {lbl}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ════ MOBILE ════ */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        position: 'relative', zIndex: 1,
        px: 2, pt: 6, pb: 5,
      }}>
        {/* Big logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 68, height: 68,
            background: 'linear-gradient(135deg, #26d982, #c8a96e)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(38,217,130,0.3)',
            mb: 2,
          }}>
            <svg width="32" height="32" viewBox="0 0 14 14" fill="none">
              <polyline points="1,11 4,7 7,9 10,4 13,2"
                stroke="#0d0f14" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Typography sx={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700, fontSize: 24,
            letterSpacing: '3px', color: '#e2e8f0', mb: 0.5,
          }}>
            TRADE<span style={{ color: '#c8a96e' }}>NOTE</span>
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#4a5568', letterSpacing: '1px' }}>
            Professional trading journal
          </Typography>
        </Box>

        {/* Floating form card */}
        <Paper elevation={8} sx={{
          width: '100%', maxWidth: 420,
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #1c2030',
          background: '#13161f',
        }}>
          <Tabs
            value={tab} onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: '1px solid #1c2030' }}
          >
            <Tab label="LOGIN" />
            <Tab label="REGISTER" />
          </Tabs>
          <Box>
            {tab === 0 && (
              <LoginForm
                onForgotPassword={() => navigate('/forgot-password')}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
            {tab === 1 && <RegisterForm onRegistered={() => setTab(0)} />}
          </Box>
          <FormFooter tab={tab} setTab={setTab} />
        </Paper>
      </Box>

      {/* ════ WELCOME MODAL ════ */}
      {showWelcome && (
        <WelcomeModal
          firstName={user?.firstName}
          onProceed={handleProceed}
        />
      )}
    </Box>
  );
};

export default AuthPage;