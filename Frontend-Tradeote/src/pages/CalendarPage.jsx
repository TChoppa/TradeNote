import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper,
  CircularProgress, Snackbar,
} from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon       from '@mui/icons-material/Logout';
import AddIcon          from '@mui/icons-material/Add';
import EditIcon         from '@mui/icons-material/Edit';
import { useAuth }      from '../context/AuthContext';
import { useNavigate }  from 'react-router-dom';
import api              from '../api/axios';
import TradeModal       from '../components/modal/TradeModal';

// ── MONTH NAMES ───────────────────────────────────
const MONTHS = [
  'January','February','March','April',
  'May','June','July','August',
  'September','October','November','December'
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── LOGO ─────────────────────────────────────────
const Logo = () => (
  <Box sx={{ display:'flex', alignItems:'center', gap:1.2 }}>
    <Box sx={{
      width:28, height:28,
      background:'linear-gradient(135deg, #26d982, #c8a96e)',
      borderRadius:'7px',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 0 12px rgba(38,217,130,0.3)',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polyline points="1,11 4,7 7,9 10,4 13,2"
          stroke="#0d0f14" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Box>
    <Typography sx={{
      fontFamily:"'Orbitron', monospace",
      fontWeight:700, fontSize:{ xs:13, md:15 },
      letterSpacing:{ xs:'1px', md:'2px' }, color:'#e2e8f0'
    }}>
      TRADE<span style={{ color:'#c8a96e' }}>NOTE</span>
    </Typography>
  </Box>
);

// ── DAY CELL ─────────────────────────────────────
const DayCell = ({
  day, isCurrentMonth, isToday,
  dayData, onClick, onEdit, isFuture,
}) => {
  const [hovered, setHovered] = useState(false);

  const hasData  = dayData && dayData.tradeCount > 0;
  const isProfit = hasData && dayData.totalProfitLoss >= 0;
  const isLoss   = hasData && dayData.totalProfitLoss < 0;

  const formatPnl = (val) => {
    const abs = Math.abs(val);
    const str = abs >= 1000
      ? `$${parseFloat((abs / 1000).toFixed(2))}k`
      : `$${Math.round(abs)}`;
    return val >= 0 ? `+${str}` : `-${str}`;
  };

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        background: isCurrentMonth
          ? isFuture ? '#0f111a' : '#171d28'
          : '#0a0c12',
        border: '1px solid',
        borderColor: isToday
          ? '#c8a96e'
          : isFuture
            ? '#13161f'
            : isProfit
              ? '#26d982'
              : isLoss
                ? 'rgba(255,82,82,0.2)'
                : '#1c2030',
        borderWidth: isToday || isProfit ? '1.5px' : '1px',
        borderRadius: '10px',
        p: '7px 7px 8px',
        minHeight: { xs:52, md:76 },
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: !isCurrentMonth ? 'default' : isFuture ? 'not-allowed' : 'pointer',
        opacity: !isCurrentMonth ? 0.2 : isFuture ? 0.35 : 1,
        transition: 'all 0.15s ease',
        boxShadow: isToday
          ? '0 0 12px rgba(200,169,110,0.2)'
          : isProfit
            ? '0 0 10px rgba(38,217,130,0.15)'
            : 'none',
        '&:hover': isCurrentMonth && !isFuture ? {
          transform: 'translateY(-2px) scale(1.02)',
          zIndex: 2,
          boxShadow: isProfit
            ? '0 4px 20px rgba(38,217,130,0.25)'
            : isLoss
              ? '0 4px 20px rgba(255,82,82,0.15)'
              : '0 4px 20px rgba(0,0,0,0.4)',
        } : {},
      }}
    >
      {/* Day number */}
      <Typography sx={{
        fontSize:10, fontWeight:600,
        color: isToday ? '#c8a96e' : isFuture ? '#2e3f58' : '#4a5568',
        lineHeight:1,
      }}>
        {day}
      </Typography>

      {/* TODAY badge */}
      {isToday && !hasData && (
        <Box sx={{
          position:'absolute', top:4, right:4,
          fontSize:7, fontFamily:"'Orbitron', monospace",
          color:'#c8a96e', background:'rgba(200,169,110,0.15)',
          px:0.6, py:0.3, borderRadius:'3px', letterSpacing:'0.5px',
        }}>
          TODAY
        </Box>
      )}

      {/* EDIT button — days with data, non-future */}
      {hasData && hovered && isCurrentMonth && !isFuture && (
        <Box
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          sx={{
            position:'absolute', top:4, right:4,
            background:'rgba(200,169,110,0.15)',
            border:'1px solid rgba(200,169,110,0.3)',
            borderRadius:'4px', px:0.7, py:0.2,
            display:'flex', alignItems:'center', gap:0.3,
            cursor:'pointer',
            '&:hover':{ background:'rgba(200,169,110,0.25)' }
          }}
        >
          <EditIcon sx={{ fontSize:9, color:'#c8a96e' }}/>
          <Typography sx={{
            fontSize:8, color:'#c8a96e',
            fontFamily:"'JetBrains Mono', monospace", letterSpacing:'0.5px',
          }}>
            EDIT
          </Typography>
        </Box>
      )}

      {/* ADD button — empty past/today days */}
      {!hasData && hovered && isCurrentMonth && !isFuture && (
        <Box sx={{
          position:'absolute', top:4, right:4,
          background:'rgba(38,217,130,0.1)',
          border:'1px solid rgba(38,217,130,0.2)',
          borderRadius:'4px', px:0.7, py:0.2,
          display:'flex', alignItems:'center', gap:0.3,
        }}>
          <AddIcon sx={{ fontSize:9, color:'#26d982' }}/>
          <Typography sx={{
            fontSize:8, color:'#26d982',
            fontFamily:"'JetBrains Mono', monospace",
          }}>
            ADD
          </Typography>
        </Box>
      )}

      {/* P&L value */}
      {hasData ? (
        <Box sx={{
          flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:0.3,
        }}>
          <Typography sx={{
            fontFamily:"'Orbitron', monospace", fontWeight:700,
            fontSize: Math.abs(dayData.totalProfitLoss) >= 1000 ? 11 : 12,
            color: isProfit ? '#26d982' : '#ff5252', lineHeight:1,
          }}>
            {formatPnl(dayData.totalProfitLoss)}
          </Typography>
          <Typography sx={{
            fontSize:8, color: isProfit ? '#1db864' : '#ff5252',
            letterSpacing:'0.5px', opacity:0.8,
          }}>
            {dayData.tradeCount === 1 ? '1 trade' : `${dayData.tradeCount} trades`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Typography sx={{ color: isFuture ? '#13161f' : '#1c2030', fontSize:16 }}>—</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── MAIN CALENDAR PAGE ────────────────────────────
const CalendarPage = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const today            = new Date();

  const todayDateOnly = new Date(
    today.getFullYear(), today.getMonth(), today.getDate()
  );

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [monthData, setMonthData] = useState({});
  const [loading,   setLoading]   = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  // ── Future date toast (works on mobile + desktop) ─
  const [toastOpen, setToastOpen] = useState(false);

  // ── Fetch month summary ───────────────────────
  const fetchMonthData = async (year, month) => {
    setLoading(true);
    try {
      const res = await api.get('/trade/month-summary', {
        params: { year, month: month + 1 }
      });
      if (res.data.success) {
        const map = {};
        res.data.data.forEach(d => {
          const key = d.tradeDate.split('T')[0];
          map[key] = d;
        });
        setMonthData(map);
      }
    } catch (err) {
      console.error('Failed to fetch month data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonthData(viewYear, viewMonth); }, [viewYear, viewMonth]);

  // ── Navigation ────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Build calendar cells ──────────────────────
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ day: d, current: false });

  // ── Smart click handler ───────────────────────
  const handleDayClick = (day, isCurrentMonth, hasData, isFuture) => {
    if (!isCurrentMonth) return;
    if (isFuture) {
      // show toast on both mobile and desktop
      setToastOpen(true);
      return;
    }
    setModalDate(new Date(viewYear, viewMonth, day));
    setModalMode(hasData ? 'edit' : 'add');
    setModalOpen(true);
  };

  const handleEditClick = (day) => {
    setModalDate(new Date(viewYear, viewMonth, day));
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalDate(null);
    fetchMonthData(viewYear, viewMonth);
  };

  // ── Monthly stats ─────────────────────────────
  const stats = Object.values(monthData).reduce(
    (acc, d) => {
      acc.totalPnl += d.totalProfitLoss;
      if (d.totalProfitLoss >= 0) acc.winDays++;
      else acc.lossDays++;
      acc.tradeDays++;
      return acc;
    },
    { totalPnl: 0, winDays: 0, lossDays: 0, tradeDays: 0 }
  );

  const winRate = stats.tradeDays > 0
    ? Math.round((stats.winDays / stats.tradeDays) * 100)
    : 0;

  const fmtPnl = (val) => {
    const abs = Math.abs(val);
    const str = abs >= 1000
      ? `$${parseFloat((abs / 1000).toFixed(2))}k`
      : `$${Math.round(abs)}`;
    return val >= 0 ? `+${str}` : `-${str}`;
  };

  const dateKey = (day) => {
    const y = viewYear;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const dayValues = Object.values(monthData);
  const bestDay   = dayValues.length ? dayValues.reduce((a, b) => a.totalProfitLoss >= b.totalProfitLoss ? a : b) : null;
  const worstDay  = dayValues.length ? dayValues.reduce((a, b) => a.totalProfitLoss <= b.totalProfitLoss ? a : b) : null;
  const wins      = dayValues.filter(d => d.totalProfitLoss >= 0);
  const losses    = dayValues.filter(d => d.totalProfitLoss < 0);
  const avgWin    = wins.length   ? wins.reduce((s, d) => s + d.totalProfitLoss, 0) / wins.length   : 0;
  const avgLoss   = losses.length ? losses.reduce((s, d) => s + d.totalProfitLoss, 0) / losses.length : 0;

  const SidebarRow = ({ label, value, color }) => (
    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:0.8, borderBottom:'1px solid #1c2030' }}>
      <Typography sx={{ fontSize:11, color:'#4a5568' }}>{label}</Typography>
      <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:11, fontWeight:700, color: color || '#e2e8f0' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight:'100vh', background:'#0d0f14' }}>

      {/* NAVBAR */}
      <Box sx={{
        background:'#13161f', borderBottom:'1px solid #1c2030',
        px:{ xs:1.5, md:3 }, height:56,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:10, overflow:'hidden',
      }}>
        <Logo />
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Typography sx={{ fontSize:11, color:'#4a5568' }}>
            {' '}<span style={{ color:'#26d982' }}>{user?.firstName}</span>
          </Typography>
          <Button variant="outlined" size="small" startIcon={<LogoutIcon sx={{ fontSize:14 }}/>} onClick={handleLogout} sx={{ fontSize:11, py:0.6, px:1.5 }}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{
        maxWidth:{ xs:'100%', md:1100 }, mx:'auto',
        p:{ xs:'10px 8px', md:'20px 20px' },
        display:'flex', flexDirection:{ xs:'column', md:'row' },
        gap:{ xs:1.5, md:2.5 }, alignItems:'flex-start',
        boxSizing:'border-box', width:'100%', overflowX:'hidden',
      }}>

        {/* MOBILE: P&L hero + stats */}
        <Box sx={{ display:{ xs:'block', md:'none' }, width:'100%', boxSizing:'border-box' }}>
          <Box sx={{
            background:'#13161f', border:'1px solid',
            borderColor: stats.totalPnl >= 0 ? 'rgba(38,217,130,0.4)' : 'rgba(255,82,82,0.3)',
            borderRadius:'12px', p:'12px 16px',
            display:'flex', alignItems:'center', justifyContent:'space-between', mb:1.2,
          }}>
            <Box>
              <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>
                {MONTHS[viewMonth].toUpperCase()} {viewYear}
              </Typography>
              <Typography sx={{
                fontFamily:"'Orbitron', monospace", fontSize:22, fontWeight:700,
                color: stats.totalPnl >= 0 ? '#26d982' : '#ff5252', lineHeight:1,
              }}>
                {fmtPnl(stats.totalPnl)}
              </Typography>
            </Box>
            <Box sx={{ textAlign:'right' }}>
              <Typography sx={{ fontSize:10, color:'#4a5568', mb:0.5 }}>
                Win rate <span style={{ color:'#e2e8f0', fontWeight:600 }}>{winRate}%</span>
              </Typography>
              <Typography sx={{ fontSize:10, color:'#4a5568' }}>
                Days traded <span style={{ color:'#e2e8f0', fontWeight:600 }}>{stats.tradeDays}</span>
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, mb:1.5 }}>
            {[
              { label:'WIN',  value: stats.winDays,  color:'#26d982' },
              { label:'LOSS', value: stats.lossDays, color:'#ff5252' },
              { label:'RATE', value:`${winRate}%`,   color: winRate >= 50 ? '#26d982' : '#ff5252' },
            ].map(({ label, value, color }) => (
              <Paper key={label} sx={{ p:'8px 10px', borderRadius:'8px', textAlign:'center', background:'#13161f' }}>
                <Typography sx={{ fontSize:8, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>{label}</Typography>
                <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:16, fontWeight:700, color }}>{value}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* CALENDAR PANEL */}
        <Box sx={{ flex:{ md:2 }, minWidth:0, width:'100%', boxSizing:'border-box', overflowX:'hidden' }}>
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1.5 }}>
            <Button variant="outlined" size="small" startIcon={<ChevronLeftIcon/>} onClick={prevMonth} sx={{ fontSize:11 }}>Prev</Button>
            <Box sx={{ textAlign:'center' }}>
              <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:{ xs:15, md:18 }, fontWeight:700, color:'#e2e8f0' }}>
                {MONTHS[viewMonth]} <span style={{ color:'#4a5568' }}>{viewYear}</span>
              </Typography>
              {loading && <CircularProgress size={12} sx={{ color:'#26d982', mt:0.3 }}/>}
            </Box>
            <Button variant="outlined" size="small" endIcon={<ChevronRightIcon/>} onClick={nextMonth} sx={{ fontSize:11 }}>Next</Button>
          </Box>

          {/* Day headers */}
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'5px', mb:'5px' }}>
            {DAYS.map(d => (
              <Typography key={d} sx={{ textAlign:'center', fontSize:10, color:'#4a5568', py:0.5, letterSpacing:'1px' }}>{d}</Typography>
            ))}
          </Box>

          {/* Calendar grid — no Tooltip, click handler manages future */}
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'5px' }}>
            {cells.map((cell, idx) => {
              const key      = cell.current ? dateKey(cell.day) : null;
              const dayData  = key ? monthData[key] : null;
              const hasData  = !!(dayData && dayData.tradeCount > 0);
              const isToday  = cell.current
                && cell.day  === today.getDate()
                && viewMonth === today.getMonth()
                && viewYear  === today.getFullYear();
              const isFuture = cell.current &&
                new Date(viewYear, viewMonth, cell.day) > todayDateOnly;

              return (
                <DayCell
                  key={idx}
                  day={cell.day}
                  isCurrentMonth={cell.current}
                  isToday={isToday}
                  dayData={dayData}
                  isFuture={isFuture}
                  onClick={() => handleDayClick(cell.day, cell.current, hasData, isFuture)}
                  onEdit={() => handleEditClick(cell.day)}
                />
              );
            })}
          </Box>

          <Typography sx={{ textAlign:'center', fontSize:10, color:'#2e3f58', mt:1.5, letterSpacing:'0.5px' }}>
            Click any past day to add · Days with trades open in edit mode
          </Typography>
        </Box>

        {/* DESKTOP SIDEBAR */}
        <Box sx={{
          display:{ xs:'none', md:'flex' }, flex:1, minWidth:200,
          flexDirection:'column', gap:1.5,
          position:'sticky', top:76, alignSelf:'flex-start',
        }}>
          <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:13, fontWeight:700, color:'#e2e8f0', letterSpacing:'1px' }}>
            {MONTHS[viewMonth]} <span style={{ color:'#4a5568' }}>{viewYear}</span>
          </Typography>

          <Paper sx={{
            p:'14px 16px', borderRadius:'12px', background:'#13161f', border:'1px solid',
            borderColor: stats.totalPnl >= 0 ? 'rgba(38,217,130,0.35)' : 'rgba(255,82,82,0.25)',
          }}>
            <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.6 }}>MONTHLY P&L</Typography>
            <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:26, fontWeight:700, color: stats.totalPnl >= 0 ? '#26d982' : '#ff5252', lineHeight:1 }}>
              {fmtPnl(stats.totalPnl)}
            </Typography>
          </Paper>

          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
            <Paper sx={{ p:'10px 12px', borderRadius:'10px', background:'#13161f' }}>
              <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>WIN DAYS</Typography>
              <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:20, fontWeight:700, color:'#26d982' }}>{stats.winDays}</Typography>
            </Paper>
            <Paper sx={{ p:'10px 12px', borderRadius:'10px', background:'#13161f' }}>
              <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>LOSS DAYS</Typography>
              <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:20, fontWeight:700, color:'#ff5252' }}>{stats.lossDays}</Typography>
            </Paper>
          </Box>

          <Paper sx={{ p:'12px 14px', borderRadius:'10px', background:'#13161f' }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.8 }}>
              <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px' }}>WIN RATE</Typography>
              <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:11, fontWeight:700, color: winRate >= 50 ? '#26d982' : '#ff5252' }}>{winRate}%</Typography>
            </Box>
            <Box sx={{ height:5, borderRadius:'3px', background:'#1c2030', overflow:'hidden' }}>
              <Box sx={{ height:'100%', width:`${winRate}%`, background: winRate >= 50 ? '#26d982' : '#ff5252', borderRadius:'3px', transition:'width 0.4s ease' }}/>
            </Box>
          </Paper>

          <Paper sx={{ p:'10px 14px', borderRadius:'10px', background:'#13161f' }}>
            <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>TRADE DAYS</Typography>
            <Typography sx={{ fontFamily:"'Orbitron', monospace", fontSize:20, fontWeight:700, color:'#e2e8f0' }}>{stats.tradeDays}</Typography>
          </Paper>

          <Box sx={{ borderTop:'1px solid #1c2030', pt:1 }}>
            <SidebarRow label="Best day"  value={bestDay  ? fmtPnl(bestDay.totalProfitLoss)  : '—'} color="#26d982"/>
            <SidebarRow label="Worst day" value={worstDay ? fmtPnl(worstDay.totalProfitLoss) : '—'} color="#ff5252"/>
            <SidebarRow label="Avg win"   value={wins.length   ? fmtPnl(avgWin)  : '—'} color="#26d982"/>
            <SidebarRow label="Avg loss"  value={losses.length ? fmtPnl(avgLoss) : '—'} color="#ff5252"/>
          </Box>
        </Box>

      </Box>

      {/* ── FUTURE DATE TOAST (works on mobile + desktop) ── */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
        message=""
        ContentProps={{ sx: { display:'none' } }}
      >
        <Box sx={{
          background:'#1c2030',
          border:'1px solid rgba(255,82,82,0.4)',
          borderRadius:'10px',
          px:2.5, py:1.2,
          display:'flex', alignItems:'center', gap:1,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <Box sx={{
            width:20, height:20, borderRadius:'50%',
            background:'rgba(255,82,82,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0,
          }}>
            <Typography sx={{ fontSize:11 }}>🔒</Typography>
          </Box>
          <Typography sx={{
            fontSize:12, color:'#ff5252',
            fontFamily:"'JetBrains Mono', monospace",
            letterSpacing:'0.3px',
          }}>
            Can't log trades for future dates
          </Typography>
        </Box>
      </Snackbar>

      {/* TRADE MODAL */}
      {modalOpen && (
        <TradeModal
          open={modalOpen}
          date={modalDate}
          mode={modalMode}
          onClose={handleModalClose}
        />
      )}

    </Box>
  );
};

export default CalendarPage;