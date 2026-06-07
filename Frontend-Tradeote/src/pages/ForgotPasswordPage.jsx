import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography,
  Alert, CircularProgress
} from '@mui/material';
import LockOutlinedIcon          from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon         from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlinedIcon   from '@mui/icons-material/CheckCircleOutlined';
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

      {/* Mini bar chart */}
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

// ── STEP INDICATOR ────────────────────────────────
const StepIndicator = ({ current }) => {
  const steps = ['EMAIL', 'OTP', 'RESET'];
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mb: 2.5 }}>
      {steps.map((step, i) => (
        <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 72 }}>
            <Box sx={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
              border: '1.5px solid',
              borderColor: i < current ? '#26d982' : i === current ? '#c8a96e' : '#1c2030',
              background: i < current
                ? 'rgba(38,217,130,0.1)'
                : i === current
                  ? 'rgba(200,169,110,0.1)'
                  : '#0d0f14',
              color: i < current ? '#26d982' : i === current ? '#c8a96e' : '#2e3f58',
            }}>
              {i < current ? '✓' : i + 1}
            </Box>
            <Typography sx={{
              fontSize: 8, mt: 0.5, letterSpacing: '0.5px',
              color: i < current ? '#26d982' : i === current ? '#c8a96e' : '#2e3f58',
            }}>
              {step}
            </Typography>
          </Box>
          {i < steps.length - 1 && (
            <Box sx={{ width: 34, height: 1, mt: '15px', background: i < current ? '#26d982' : '#1c2030' }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

// ── OTP INPUT ─────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (val.length > 1) return;
    if (val && !/^\d$/.test(val)) return;
    const otpArray = value.split('');
    otpArray[idx] = val;
    onChange(otpArray.join(''));
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx]) {
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
    } else if (e.key === 'Backspace') {
      const otpArray = value.split('');
      otpArray[idx] = '';
      onChange(otpArray.join(''));
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: { xs: 0.8, md: 1 }, justifyContent: 'center', my: 1.5 }}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          style={{
            width: 46, height: 54,
            background: 'rgba(255,255,255,0.02)',
            border: '1.5px solid #2e3f58',
            borderRadius: '10px',
            textAlign: 'center',
            fontFamily: "'Orbitron', monospace",
            fontSize: 24, fontWeight: 700,
            color: '#c8a96e', padding: 0,
            boxSizing: 'border-box',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#26d982'; e.target.style.boxShadow = '0 0 0 2px rgba(38,217,130,0.2)'; }}
          onBlur={(e)  => { e.target.style.borderColor = '#2e3f58'; e.target.style.boxShadow = 'none'; }}
        />
      ))}
    </Box>
  );
};

// ── CARD ICON ─────────────────────────────────────
// Defined OUTSIDE ForgotPasswordPage to prevent remount on every state change
const CardIcon = ({ icon: Icon, color, bg }) => (
  <Box sx={{
    width: 52, height: 52, borderRadius: '14px',
    background: bg, border: `1px solid ${color}40`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    mx: 'auto', mb: 1.5,
  }}>
    <Icon sx={{ color, fontSize: 26 }} />
  </Box>
);

// ── STEP 0: Enter Email ───────────────────────────
// All step components defined OUTSIDE to prevent remount bug
const StepEmail = ({ email, setEmail, error, loading, onSendOtp, onBack }) => (
  <>
    <Box sx={{ p: '22px 26px 16px', borderBottom: '1px solid #1c2030', textAlign: 'center' }}>
      <CardIcon icon={LockOutlinedIcon} color="#c8a96e" bg="rgba(200,169,110,0.1)" />
      <Typography variant="h6" sx={{ mb: 0.5, letterSpacing: '1px' }}>
        Forgot Password?
      </Typography>
      <Typography sx={{ fontSize: 11, color: '#4a5568', lineHeight: 1.6 }}>
        Enter your email — we'll send a{' '}
        <span style={{ color: '#26d982' }}>6-digit OTP</span>
      </Typography>
      <Box sx={{ mt: 2 }}><StepIndicator current={0} /></Box>
    </Box>
    <Box sx={{ p: { xs: '18px 20px 20px', md: '20px 26px 22px' } }}>
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: 11 }}>{error}</Alert>}
      <TextField
        fullWidth
        label="Registered Email Address"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); }}
        onKeyDown={(e) => e.key === 'Enter' && onSendOtp()}
        sx={{ mb: 2 }}
      />
      <Alert severity="info" icon={false} sx={{
        mb: 2, fontSize: 10,
        background: 'rgba(200,169,110,0.07)',
        border: '1px solid rgba(200,169,110,0.2)',
        color: '#4a5568',
      }}>
        OTP will be sent to your email — valid for{' '}
        <strong style={{ color: '#26d982' }}>10 minutes</strong>
      </Alert>
      <Button
        fullWidth variant="contained" color="secondary"
        onClick={onSendOtp} disabled={loading}
        sx={{ mb: 1.5 }}
      >
        {loading ? <CircularProgress size={20} sx={{ color: '#0d0f14' }} /> : 'SEND OTP →'}
      </Button>
      <Typography
        onClick={onBack}
        sx={{ textAlign: 'center', fontSize: 11, color: '#4a5568', cursor: 'pointer' }}
      >
        ← Back to <span style={{ color: '#c8a96e' }}>Login</span>
      </Typography>
    </Box>
  </>
);

// ── STEP 1: Enter OTP ─────────────────────────────
const StepOtp = ({ email, otp, setOtp, error, loading, timer, onVerify, onResend, onChangeEmail, onBack }) => {
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  return (
    <>
      <Box sx={{ p: '22px 26px 16px', borderBottom: '1px solid #1c2030', textAlign: 'center' }}>
        <CardIcon icon={EmailOutlinedIcon} color="#26d982" bg="rgba(38,217,130,0.1)" />
        <Typography variant="h6" sx={{ mb: 0.5, letterSpacing: '1px' }}>
          Check Your Email
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#4a5568' }}>
          OTP sent to <span style={{ color: '#26d982' }}>{email}</span>
        </Typography>
        <Box sx={{ mt: 2 }}><StepIndicator current={1} /></Box>
      </Box>
      <Box sx={{ p: { xs: '18px 20px 20px', md: '20px 26px 22px' } }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: 11 }}>{error}</Alert>}
        <Box sx={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid #1c2030',
          borderRadius: '8px', p: '10px 14px', mb: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography sx={{ fontSize: 9, color: '#2e3f58', letterSpacing: '1px', mb: 0.3 }}>SENT TO</Typography>
            <Typography sx={{ fontSize: 11, color: '#26d982' }}>{email}</Typography>
          </Box>
          <Typography onClick={onChangeEmail} sx={{ fontSize: 9, color: '#c8a96e', cursor: 'pointer' }}>
            Change
          </Typography>
        </Box>
        <Typography sx={{
          textAlign: 'center', fontSize: 9, color: '#4a5568',
          letterSpacing: '1.5px', textTransform: 'uppercase', mb: 0.5,
        }}>
          Enter 6-Digit OTP
        </Typography>
        <OtpInput value={otp} onChange={setOtp} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Typography sx={{
            fontFamily: "'Orbitron', monospace", fontSize: 13,
            color: timer > 60 ? '#c8a96e' : '#ff5252',
          }}>
            {formatTimer(timer)}
          </Typography>
          <Typography sx={{ fontSize: 10, color: '#4a5568' }}>
            remaining ·{' '}
            <span onClick={onResend} style={{ color: '#26d982', cursor: 'pointer' }}>Resend OTP</span>
          </Typography>
        </Box>
        <Button
          fullWidth variant="contained" color="secondary"
          onClick={onVerify} disabled={loading}
          sx={{ mb: 1.5 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#0d0f14' }} /> : 'VERIFY OTP →'}
        </Button>
        <Typography onClick={onBack} sx={{ textAlign: 'center', fontSize: 11, color: '#4a5568', cursor: 'pointer' }}>
          ← Back to <span style={{ color: '#c8a96e' }}>Login</span>
        </Typography>
      </Box>
    </>
  );
};

// ── STEP 2: New Password ──────────────────────────
const StepReset = ({ newPassword, setNewPassword, confirmPassword, setConfirmPassword, error, loading, onReset, onBack }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6)           score++;
    if (pwd.length >= 10)          score++;
    if (/[A-Z]/.test(pwd))         score++;
    if (/[0-9]/.test(pwd))         score++;
    if (/[^A-Za-z0-9]/.test(pwd))  score++;
    if (score <= 2) return { level: score, label: 'WEAK',   color: '#ff5252' };
    if (score <= 3) return { level: score, label: 'GOOD',   color: '#c8a96e' };
    return              { level: score, label: 'STRONG', color: '#26d982' };
  };
  const strength = getStrength(newPassword);

  return (
    <>
      <Box sx={{ p: '22px 26px 16px', borderBottom: '1px solid #1c2030', textAlign: 'center' }}>
        <CardIcon icon={LockOutlinedIcon} color="#26d982" bg="rgba(38,217,130,0.1)" />
        <Typography variant="h6" sx={{ mb: 0.5, letterSpacing: '1px' }}>Set New Password</Typography>
        <Typography sx={{ fontSize: 11, color: '#4a5568' }}>
          OTP verified <span style={{ color: '#26d982' }}>✓</span>
        </Typography>
        <Box sx={{ mt: 2 }}><StepIndicator current={2} /></Box>
      </Box>
      <Box sx={{ p: { xs: '18px 20px 20px', md: '20px 26px 22px' } }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: 11 }}>{error}</Alert>}
        <TextField
          fullWidth label="New Password" type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 0.5 }}
        />
        {newPassword && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{
                  height: 3, flex: 1, borderRadius: 1,
                  background: i < strength.level ? strength.color : '#1c2030',
                  transition: 'background 0.3s',
                }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 9, letterSpacing: '1px', color: strength.color }}>
              STRENGTH: {strength.label}
            </Typography>
          </Box>
        )}
        <TextField
          fullWidth label="Confirm New Password" type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 0.5 }}
        />
        {confirmPassword && (
          <Typography sx={{
            fontSize: 9, mb: 2, letterSpacing: '0.5px',
            color: newPassword === confirmPassword ? '#26d982' : '#ff5252',
          }}>
            {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </Typography>
        )}
        <Alert severity="info" icon={false} sx={{
          mb: 2, fontSize: 10,
          background: 'rgba(200,169,110,0.07)',
          border: '1px solid rgba(200,169,110,0.2)',
          color: '#4a5568',
        }}>
          Minimum <strong style={{ color: '#26d982' }}>6 characters</strong>.
          Mix letters, numbers &amp; symbols.
        </Alert>
        <Button
          fullWidth variant="contained" color="primary"
          onClick={onReset} disabled={loading}
          sx={{ mb: 1.5 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#0d0f14' }} /> : 'RESET PASSWORD →'}
        </Button>
        <Typography onClick={onBack} sx={{ textAlign: 'center', fontSize: 11, color: '#4a5568', cursor: 'pointer' }}>
          ← Back to <span style={{ color: '#c8a96e' }}>Login</span>
        </Typography>
      </Box>
    </>
  );
};

// ── STEP 3: Success ───────────────────────────────
const StepSuccess = ({ onGoToLogin }) => (
  <Box sx={{ p: '40px 26px', textAlign: 'center' }}>
    <Box sx={{
      width: 70, height: 70, borderRadius: '50%',
      background: 'rgba(38,217,130,0.1)',
      border: '2px solid #26d982',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      mx: 'auto', mb: 2,
      boxShadow: '0 0 28px rgba(38,217,130,0.2)',
    }}>
      <CheckCircleOutlinedIcon sx={{ color: '#26d982', fontSize: 36 }} />
    </Box>
    <Typography variant="h6" sx={{ mb: 1, letterSpacing: '1px' }}>Password Reset!</Typography>
    <Typography sx={{ fontSize: 11, color: '#4a5568', lineHeight: 1.7, mb: 2.5, maxWidth: 250, mx: 'auto' }}>
      Your password has been successfully reset.
      You can now login with your new password.
    </Typography>
    <Alert severity="success" icon={false} sx={{
      mb: 2, fontSize: 10, justifyContent: 'center',
      background: 'rgba(38,217,130,0.07)',
      border: '1px solid rgba(38,217,130,0.2)',
      color: '#4a5568',
    }}>
      Redirecting to login in{' '}
      <span style={{ color: '#26d982', fontFamily: "'Orbitron', monospace", fontWeight: 700, marginLeft: 6 }}>
        5s
      </span>
    </Alert>
    <Button fullWidth variant="contained" color="primary" onClick={onGoToLogin}>
      GO TO LOGIN →
    </Button>
  </Box>
);

// ── MAIN FORGOT PASSWORD PAGE ─────────────────────
const ForgotPasswordPage = () => {
  const navigate                              = useNavigate();
  const [step, setStep]                       = useState(0);
  const [email, setEmail]                     = useState('');
  const [otp, setOtp]                         = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [timer, setTimer]                     = useState(600);

  const startTimer = () => {
    setTimer(600);
    const interval = setInterval(() => {
      setTimer(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) { setStep(1); startTimer(); }
      else setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.replace(/\s/g, '').length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otpCode: otp });
      if (res.data.success) setStep(2);
      else setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword.length < 6)           { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword)  { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        email, otpCode: otp, newPassword, confirmPassword,
      });
      if (res.data.success) { setStep(3); setTimeout(() => navigate('/login'), 5000); }
      else setError(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // ── Which step component to render ───────────
  const renderStep = () => {
    if (step === 0) return (
      <StepEmail
        email={email} setEmail={(v) => { setEmail(v); setError(''); }}
        error={error} loading={loading}
        onSendOtp={handleSendOtp}
        onBack={() => navigate('/login')}
      />
    );
    if (step === 1) return (
      <StepOtp
        email={email} otp={otp} setOtp={setOtp}
        error={error} loading={loading} timer={timer}
        onVerify={handleVerifyOtp}
        onResend={handleSendOtp}
        onChangeEmail={() => setStep(0)}
        onBack={() => navigate('/login')}
      />
    );
    if (step === 2) return (
      <StepReset
        newPassword={newPassword} setNewPassword={setNewPassword}
        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
        error={error} loading={loading}
        onReset={handleResetPassword}
        onBack={() => navigate('/login')}
      />
    );
    if (step === 3) return (
      <StepSuccess onGoToLogin={() => navigate('/login')} />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <GridBg />

      {/* ════ DESKTOP ════ */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0f14', overflowY: 'auto' }}>
            {renderStep()}
          </Box>
        </Paper>
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
            Reset your password
          </Typography>
        </Box>

        {/* Floating card */}
        <Paper elevation={8} sx={{
          width: '100%', maxWidth: 420,
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #1c2030',
          background: '#13161f',
        }}>
          {renderStep()}
        </Paper>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;