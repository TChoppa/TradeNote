import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Box, Typography,
  Button, TextField, IconButton, Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import AddIcon            from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon           from '@mui/icons-material/Edit';
import api                from '../../api/axios';
import { format }         from 'date-fns';

// ─────────────────────────────────────────────────
const MAX_TRADES = 5;

const emptyTrade = () => ({
  id:         null,
  stockName:  '',
  quantity:   '',
  buyAmount:  '',
  sellAmount: '',
  notes:      '',
});

const calcPnl = (trade) => {
  const buy  = parseFloat(trade.buyAmount)  || 0;
  const sell = parseFloat(trade.sellAmount) || 0;
  return sell - buy;
};

const fmtPnl = (val) => {
  if (val === 0 || isNaN(val)) return '—';
  const abs = Math.abs(val);
  const str = abs >= 1000
    ? `${(abs / 1000).toFixed(2)}k`
    : abs.toFixed(2);
  return `${val >= 0 ? '+' : '-'}₹${str}`;
};

// ─────────────────────────────────────────────────
// TRADE FORM
// ─────────────────────────────────────────────────
const TradeForm = ({ trade, onChange, mode }) => {
  const pnl      = calcPnl(trade);
  const hasPnl   = trade.buyAmount !== '' && trade.sellAmount !== '';
  const isProfit = pnl >= 0;

  const goldSx = mode === 'edit' ? {
    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
      borderColor: '#c8a96e',
      boxShadow:   '0 0 0 2px rgba(200,169,110,0.1)',
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#c8a96e' },
  } : {};

  return (
    <Box>
      {/* Row 1: Stock Symbol + No. of Stocks */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, mb:1.5 }}>
        <TextField
          fullWidth label="Stock Symbol"
          value={trade.stockName}
          onChange={e => onChange('stockName', e.target.value.toUpperCase())}
          placeholder="e.g. AAPL, TSLA"
          inputProps={{ maxLength: 10 }}
          sx={goldSx}
        />
        <TextField
          fullWidth label="No. of Stocks" type="number"
          value={trade.quantity}
          onChange={e => onChange('quantity', e.target.value)}
          placeholder="0"
          inputProps={{ min: 1 }}
          sx={goldSx}
        />
      </Box>

      {/* Row 2: Total Buy + Total Sell */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, mb:1.5 }}>
        <TextField
          fullWidth label="Total Buy Amount (₹)" type="number"
          value={trade.buyAmount}
          onChange={e => onChange('buyAmount', e.target.value)}
          placeholder="0.00"
          inputProps={{ min: 0, step: 0.01 }}
          sx={goldSx}
        />
        <TextField
          fullWidth label="Total Sell Amount (₹)" type="number"
          value={trade.sellAmount}
          onChange={e => onChange('sellAmount', e.target.value)}
          placeholder="0.00"
          inputProps={{ min: 0, step: 0.01 }}
          sx={goldSx}
        />
      </Box>

      {/* ── COMPACT Live P&L Preview ── */}
      {hasPnl && (
        <Box sx={{
          background:  isProfit ? 'rgba(38,217,130,0.07)' : 'rgba(255,82,82,0.07)',
          border:      '1px solid',
          borderColor: isProfit ? 'rgba(38,217,130,0.22)' : 'rgba(255,82,82,0.22)',
          borderRadius:'10px',
          p:'10px 14px',
          mb:1.5,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          gap:1,
        }}>
          {/* Left: label + formula */}
          <Box>
            <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.4 }}>
              P&L BREAKDOWN
            </Typography>
            <Box sx={{ display:'flex', alignItems:'center', gap:0.6, flexWrap:'wrap' }}>
              <Typography sx={{ fontSize:10, color:'#4a5568' }}>
                Sell{' '}
                <span style={{ color:'#26d982', fontWeight:600 }}>
                  ₹{parseFloat(trade.sellAmount || 0).toFixed(2)}
                </span>
              </Typography>
              <Typography sx={{ fontSize:10, color:'#2e3f58' }}>−</Typography>
              <Typography sx={{ fontSize:10, color:'#4a5568' }}>
                Buy{' '}
                <span style={{ color:'#ff5252', fontWeight:600 }}>
                  ₹{parseFloat(trade.buyAmount || 0).toFixed(2)}
                </span>
              </Typography>
            </Box>
          </Box>

          {/* Right: P&L value — compact size */}
          <Box sx={{ textAlign:'right', flexShrink:0 }}>
            <Typography sx={{
              fontFamily: "'Orbitron', monospace",
              fontSize:   { xs:14, sm:18 },
              fontWeight: 900,
              color:      isProfit ? '#26d982' : '#ff5252',
              lineHeight: 1,
            }}>
              {fmtPnl(pnl)}
            </Typography>
            <Typography sx={{ fontSize:9, color: isProfit ? '#26d982' : '#ff5252', mt:0.3, opacity:0.8 }}>
              {isProfit ? '📈 Profit' : '📉 Loss'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Notes */}
      <TextField
        fullWidth label="Notes (optional)" multiline rows={2}
        value={trade.notes}
        onChange={e => onChange('notes', e.target.value)}
        placeholder="Strategy, market conditions, lessons learned..."
        inputProps={{ maxLength: 500 }}
        sx={goldSx}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────────
// DELETE BOTTOM SHEET
// Rendered as an overlay inside the Dialog — no
// nested Dialog needed. Pure layout trick.
// ─────────────────────────────────────────────────
const DeleteBottomSheet = ({ tradeName, loading, onCancel, onConfirm }) => (
  <>
    {/* Dim overlay */}
    <Box
      onClick={onCancel}
      sx={{
        position:  'absolute',
        inset:     0,
        background:'rgba(0,0,0,0.55)',
        zIndex:    20,
        borderRadius:'16px',
      }}
    />

    {/* Sheet */}
    <Box sx={{
      position:     'absolute',
      bottom:       0, left:0, right:0,
      zIndex:       21,
      background:   '#13161f',
      border:       '1px solid rgba(255,82,82,0.3)',
      borderRadius: '14px 14px 16px 16px',
      pb:           3,
      pt:           1.5,
      px:           2.5,
    }}>
      {/* Drag handle */}
      <Box sx={{
        width:36, height:3,
        background:'#2e3f58',
        borderRadius:'2px',
        mx:'auto', mb:2,
      }}/>

      {/* Trash icon */}
      <Box sx={{
        width:48, height:48, borderRadius:'50%',
        background:'rgba(255,82,82,0.1)',
        border:'1px solid rgba(255,82,82,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        mx:'auto', mb:1.5,
      }}>
        <DeleteOutlinedIcon sx={{ color:'#ff5252', fontSize:24 }}/>
      </Box>

      {/* Title */}
      <Typography sx={{
        fontFamily: "'Orbitron', monospace",
        fontSize:   15, fontWeight:700, color:'#e2e8f0',
        textAlign:  'center', mb:0.6,
      }}>
        Delete {tradeName}?
      </Typography>

      {/* Subtitle */}
      <Typography sx={{
        fontSize:   11, color:'#4a5568',
        textAlign:  'center', lineHeight:1.6,
        mb:2.5, maxWidth:240, mx:'auto',
      }}>
        This trade will be permanently removed and cannot be undone.
      </Typography>

      {/* Buttons */}
      <Box sx={{ display:'flex', gap:1.2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          sx={{ fontSize:12, py:1.1, borderRadius:'10px' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={onConfirm}
          disabled={loading}
          sx={{
            fontSize:    12, py:1.1, borderRadius:'10px',
            background:  '#ff5252', color:'#fff', fontWeight:700,
            border:      '1px solid #ff5252',
            '&:hover':   { background:'#e04040' },
            '&:disabled':{ background:'rgba(255,82,82,0.4)', color:'rgba(255,255,255,0.5)' },
          }}
        >
          {loading
            ? <CircularProgress size={18} sx={{ color:'#fff' }}/>
            : 'Yes, Delete'}
        </Button>
      </Box>
    </Box>
  </>
);

// ─────────────────────────────────────────────────
// MAIN TRADE MODAL
// ─────────────────────────────────────────────────
const TradeModal = ({ open, date, mode, onClose }) => {

  const [trades,        setTrades]        = useState([emptyTrade()]);
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [fetching,      setFetching]      = useState(false);
  const [error,         setError]         = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isEditMode = mode === 'edit';
  const dateStr    = date
    ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    : '';
  const dateLabel = date ? format(date, 'MMMM dd, yyyy') : '';

  // ── Fetch existing trades on modal open ────────
  useEffect(() => {
    if (!open || !date) return;
    fetchTrades();
  }, [open, date]);

  const fetchTrades = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await api.get('/trade/by-date', { params: { date: dateStr } });
      if (res.data.success && res.data.data.length > 0) {
        const mapped = res.data.data.map(t => ({
          id:         t.id,
          stockName:  t.stockName,
          quantity:   t.quantity.toString(),
          buyAmount:  t.buyAmount.toString(),
          sellAmount: t.sellAmount.toString(),
          notes:      t.notes || '',
        }));
        setTrades(mapped);
        setActiveIdx(0);
      } else {
        setTrades([emptyTrade()]);
        setActiveIdx(0);
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err);
      setTrades([emptyTrade()]);
    } finally {
      setFetching(false);
    }
  };

  // ── Update field in active trade ───────────────
  const handleChange = (field, value) => {
    setTrades(prev => prev.map((t, i) => i === activeIdx ? { ...t, [field]: value } : t));
    setError('');
  };

  // ── Add new empty trade tab ────────────────────
  const handleAddTab = () => {
    if (trades.length >= MAX_TRADES) return;
    const updated = [...trades, emptyTrade()];
    setTrades(updated);
    setActiveIdx(updated.length - 1);
    setError('');
  };

  // ── Validate a single trade ────────────────────
  const validateTrade = (trade) => {
    if (!trade.stockName.trim())
      return 'Stock symbol is required';
    if (!trade.quantity || parseInt(trade.quantity) < 1)
      return 'Number of stocks must be at least 1';
    if (!trade.buyAmount || parseFloat(trade.buyAmount) <= 0)
      return 'Total buy amount must be greater than 0';
    if (!trade.sellAmount || parseFloat(trade.sellAmount) <= 0)
      return 'Total sell amount must be greater than 0';
    return null;
  };

  // ── Save all trades ────────────────────────────
  const handleSave = async () => {
    setError('');
    for (let i = 0; i < trades.length; i++) {
      const err = validateTrade(trades[i]);
      if (err) { setActiveIdx(i); setError(`Trade #${i + 1}: ${err}`); return; }
    }
    setLoading(true);
    try {
      for (const trade of trades) {
        const payload = {
          stockName:  trade.stockName,
          quantity:   parseInt(trade.quantity),
          buyAmount:  parseFloat(trade.buyAmount),
          sellAmount: parseFloat(trade.sellAmount),
          notes:      trade.notes || '',
        };
        if (trade.id) {
          await api.put(`/trade/${trade.id}`, payload);
        } else {
          await api.post('/trade', { ...payload, tradeDate: dateStr });
        }
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete single trade ────────────────────────
  const handleDelete = async () => {
    const trade = trades[activeIdx];
    if (!trade.id) {
      const updated = trades.filter((_, i) => i !== activeIdx);
      setTrades(updated.length > 0 ? updated : [emptyTrade()]);
      setActiveIdx(Math.max(0, activeIdx - 1));
      setDeleteConfirm(false);
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/trade/${trade.id}`);
      const updated = trades.filter((_, i) => i !== activeIdx);
      if (updated.length === 0) {
        onClose();
      } else {
        setTrades(updated);
        setActiveIdx(Math.max(0, activeIdx - 1));
      }
      setDeleteConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trade.');
    } finally {
      setLoading(false);
    }
  };

  const activeTrade = trades[activeIdx] || emptyTrade();
  const totalPnl    = trades.reduce((sum, t) => sum + calcPnl(t), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background:   '#13161f',
          border:       '1px solid',
          borderColor:  isEditMode ? 'rgba(200,169,110,0.35)' : '#1c2030',
          borderRadius: '16px',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.8)',
          mx:        { xs:1,      sm:'auto' },
          my:        { xs:1,      sm:'auto' },
          width:     { xs:'100%', sm:560    },
          maxHeight: { xs:'95vh', sm:'88vh' },
          // needed so the bottom sheet overlay clips properly
          overflow:  'hidden',
          position:  'relative',
        },
      }}
    >

      {/* ════ HEADER ════ */}
      <Box sx={{
        p:'18px 20px 14px', borderBottom:'1px solid #1c2030',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      }}>
        {/* Left: mode chip + date */}
        <Box>
          <Chip
            label={isEditMode ? '✎  EDIT MODE' : '+  ADD MODE'}
            size="small"
            sx={{
              mb:1,
              fontFamily:  "'JetBrains Mono', monospace",
              fontSize:9, letterSpacing:'1px', fontWeight:700,
              background:  isEditMode ? 'rgba(200,169,110,0.12)' : 'rgba(38,217,130,0.12)',
              color:       isEditMode ? '#c8a96e' : '#26d982',
              border:      '1px solid',
              borderColor: isEditMode ? 'rgba(200,169,110,0.3)' : 'rgba(38,217,130,0.3)',
            }}
          />
          <Typography sx={{
            fontFamily: "'Orbitron', monospace",
            fontSize:   { xs:14, sm:16 }, fontWeight:700,
          }}>
            {dateLabel}
          </Typography>
          <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mt:0.3 }}>
            TRADE JOURNAL
          </Typography>
        </Box>

        {/* Right: compact total P&L + close */}
        <Box sx={{ display:'flex', alignItems:'flex-start', gap:1 }}>
          <Box sx={{ textAlign:'right' }}>
            <Typography sx={{ fontSize:9, color:'#4a5568', letterSpacing:'1px', mb:0.3 }}>
              TOTAL P&L
            </Typography>
            {/* ── Compact on mobile, larger on desktop ── */}
            <Typography sx={{
              fontFamily: "'Orbitron', monospace",
              fontSize:   { xs:14, sm:20 },
              fontWeight: 900,
              color:      totalPnl >= 0 ? '#26d982' : '#ff5252',
              lineHeight: 1,
            }}>
              {fmtPnl(totalPnl)}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose} size="small"
            sx={{ mt:-0.5, color:'#4a5568', '&:hover':{ color:'#e2e8f0' } }}
          >
            <CloseIcon fontSize="small"/>
          </IconButton>
        </Box>
      </Box>

      {/* ════ TRADE TABS ════ */}
      <Box sx={{ px:2.5, pt:1.5, display:'flex', gap:0.8, alignItems:'center', flexWrap:'wrap' }}>
        {trades.map((t, i) => {
          const pnl      = calcPnl(t);
          const isActive = i === activeIdx;
          return (
            <Box
              key={i}
              onClick={() => { setActiveIdx(i); setError(''); }}
              sx={{
                padding:'5px 12px', borderRadius:'7px', border:'1px solid',
                borderColor: isActive ? (isEditMode ? '#c8a96e' : '#26d982') : '#1c2030',
                background:  isActive
                  ? (isEditMode ? 'rgba(200,169,110,0.08)' : 'rgba(38,217,130,0.08)')
                  : 'rgba(255,255,255,0.02)',
                cursor:'pointer', fontSize:11,
                color: isActive ? (isEditMode ? '#c8a96e' : '#26d982') : '#4a5568',
                display:'flex', gap:0.8, alignItems:'center', transition:'all 0.15s',
                '&:hover':{ borderColor: isEditMode ? '#c8a96e' : '#26d982', color: isEditMode ? '#c8a96e' : '#26d982' },
              }}
            >
              <span>#{i + 1} {t.stockName || 'New'}</span>
              {t.buyAmount && t.sellAmount && (
                <span style={{
                  fontFamily:"'Orbitron', monospace", fontSize:9, fontWeight:700,
                  color: pnl >= 0 ? '#26d982' : '#ff5252',
                }}>
                  {fmtPnl(pnl)}
                </span>
              )}
            </Box>
          );
        })}

        {trades.length < MAX_TRADES && (
          <Box
            onClick={handleAddTab}
            sx={{
              padding:'5px 10px', borderRadius:'7px', border:'1px dashed #1c2030',
              cursor:'pointer', fontSize:11, color:'#4a5568',
              display:'flex', alignItems:'center', gap:0.3, transition:'all 0.15s',
              '&:hover':{ borderColor:'#26d982', color:'#26d982' },
            }}
          >
            <AddIcon sx={{ fontSize:13 }}/> Add Stock
          </Box>
        )}

        {trades.length > 1 && (
          <Typography sx={{
            ml:'auto', fontSize:10,
            fontFamily:"'Orbitron', monospace",
            color: trades.length >= MAX_TRADES ? '#c8a96e' : '#2e3f58',
          }}>
            {trades.length}/{MAX_TRADES}{trades.length >= MAX_TRADES ? '  MAX' : ''}
          </Typography>
        )}
      </Box>

      {/* ════ BODY ════ */}
      <DialogContent sx={{ pt:1.5, px:2.5, pb:1 }}>
        {fetching ? (
          <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', py:5 }}>
            <CircularProgress size={28} sx={{ color:'#26d982' }}/>
          </Box>
        ) : (
          <>
            {error && (
              <Box sx={{
                mb:1.5, p:'10px 14px',
                background:'rgba(255,82,82,0.08)',
                border:'1px solid rgba(255,82,82,0.25)',
                borderRadius:'8px',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <Typography sx={{ fontSize:11, color:'#ff5252' }}>{error}</Typography>
                <IconButton size="small" onClick={() => setError('')} sx={{ color:'#ff5252', p:0.3 }}>
                  <CloseIcon sx={{ fontSize:14 }}/>
                </IconButton>
              </Box>
            )}

            <TradeForm trade={activeTrade} onChange={handleChange} mode={mode} />
          </>
        )}
      </DialogContent>

      {/* ════ FOOTER — single row, no wrap ════ */}
      <Box
  sx={{
    px: 2,
    ml: -1,
    pt: 2,
    pb: 2.5,
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    borderTop: '2px solid #1c2030',
    mt: 1,
    flexWrap: 'nowrap',
  }}
>
        {/* Delete button — only for saved trades */}
        {activeTrade.id && (
          <Button
            onClick={() => setDeleteConfirm(true)}
            sx={{
              fontSize:    { xs:10, sm:11 },
              color:       '#ff5252',
              border:      '1px solid rgba(255,82,82,0.3)',
              borderRadius:'8px',
              px:          { xs:1, sm:2 },
              py:          { xs:0.6, sm:0.8 },
              minWidth:    'auto',
              flexShrink:  0,
              whiteSpace:  'nowrap',
              '&:hover':   { background:'rgba(255,82,82,0.08)', borderColor:'#ff5252' },
            }}
          >
            <Box sx={{ display:{ xs:'flex', sm:'none' }, alignItems:'center', gap:0.4 }}>
              <DeleteOutlinedIcon sx={{ fontSize:14 }}/>
              <span style={{ fontSize:10 }}>Del</span>
            </Box>
            <Box sx={{ display:{ xs:'none', sm:'flex' }, alignItems:'center', gap:0.5 }}>
              <DeleteOutlinedIcon sx={{ fontSize:14 }}/>
              <span>Delete</span>
            </Box>
          </Button>
        )}

        <Box sx={{ flex:1 }}/>

        {/* Cancel */}
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            fontSize:   { xs:10, sm:11 },
            px:         { xs:1.5, sm:2 },
            py:         { xs:0.6, sm:0.8 },
            minWidth:   'auto',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Cancel
        </Button>

        {/* Save / Update */}
        <Button
          variant="contained"
          color={isEditMode ? 'secondary' : 'primary'}
          onClick={handleSave}
          disabled={loading || fetching}
          startIcon={isEditMode && !loading ? <EditIcon sx={{ fontSize:{ xs:12, sm:15 } }}/> : null}
          sx={{
            fontSize:   { xs:10, sm:11 },
            px:         { xs:1.5, sm:2 },
            py:         { xs:0.6, sm:0.8 },
            minWidth:   'auto',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color:'#0d0f14' }}/>
          ) : isEditMode ? (
            <>
              <Box component="span" sx={{ display:{ xs:'none', sm:'inline' } }}>Update Trade</Box>
              <Box component="span" sx={{ display:{ xs:'inline', sm:'none' } }}>Update</Box>
            </>
          ) : (
            <>
              <Box component="span" sx={{ display:{ xs:'none', sm:'inline' } }}>Save Trades</Box>
              <Box component="span" sx={{ display:{ xs:'inline', sm:'none' } }}>Save</Box>
            </>
          )}
        </Button>
      </Box>

      {/* ════ DELETE BOTTOM SHEET OVERLAY ════
          Rendered inside the Dialog (position:absolute)
          so it clips to the modal border-radius.
          Only visible when deleteConfirm is true.
      ════════════════════════════════════════ */}
      {deleteConfirm && (
        <DeleteBottomSheet
          tradeName={activeTrade.stockName || `Trade #${activeIdx + 1}`}
          loading={loading}
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}

    </Dialog>
  );
};

export default TradeModal;