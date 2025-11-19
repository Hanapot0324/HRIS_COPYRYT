import API_BASE_URL from '../../apiConfig';
import { jwtDecode } from 'jwt-decode';
import React, { useRef, forwardRef, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Fade,
  Backdrop,
  styled,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import LoadingOverlay from '../LoadingOverlay';
import WorkIcon from '@mui/icons-material/Work';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import logo from '../../assets/logo.png';
import hrisLogo from '../../assets/hrisLogo.png';
import SuccessfulOverlay from '../SuccessfulOverlay';
import { Refresh, Download } from '@mui/icons-material';

// Professional styled components with swapped colors
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: 'rgba(254, 249, 225, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 40px rgba(109, 35, 35, 0.08)',
  border: '1px solid rgba(109, 35, 35, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(109, 35, 35, 0.15)',
    transform: 'translateY(-4px)',
  },
}));

const ProfessionalButton = styled(Button)(({ theme, variant, color = 'primary' }) => ({
  borderRadius: 12,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
  boxShadow: variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 6px 20px rgba(254, 249, 225, 0.35)' : 'none',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const Payslip = forwardRef(({ employee }, ref) => {
  const payslipRef = ref || useRef();

  const [allPayroll, setAllPayroll] = useState([]);
  const [displayEmployee, setDisplayEmployee] = useState(employee || null);
  const [loading, setLoading] = useState(!employee);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: 'success',
    message: '',
  });

  const [search, setSearch] = useState(''); // search input
  const [hasSearched, setHasSearched] = useState(false); // flag if search was done
  const [selectedMonth, setSelectedMonth] = useState(''); // which month is selected
  const [filteredPayroll, setFilteredPayroll] = useState([]); // search r
  const [personID, setPersonID] = useState('');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Swapped color scheme
  const primaryColor = '#FEF9E1'; // Now cream is primary
  const secondaryColor = '#FFF8E7'; // Light cream
  const accentColor = '#6d2323'; // Burgundy is now accent
  const accentDark = '#8B3333'; // Darker burgundy
  const blackColor = '#1a1a1a';
  const whiteColor = '#FFFFFF';
  const grayColor = '#6c757d';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log(
      'Token from localStorage:',
      token ? 'Token exists' : 'No token found'
    );
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  useEffect(() => {
    // Retrieve and decode the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPersonID(decoded.employeeNumber); // Set the employeeNumber in state
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!employee) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE_URL}/PayrollReleasedRoute/released-payroll-detailed`,
            getAuthHeaders()
          );
          setAllPayroll(res.data); // ✅ just store everything
          setDisplayEmployee(null); // ✅ don't auto-display until month is chosen
          setLoading(false);
        } catch (err) {
          console.error('Error fetching payroll:', err);
          setError('Failed to fetch payroll data. Please try again.');
          setLoading(false);
        }
      };

      if (personID) fetchData();
    }
  }, [employee, personID]);

  // Download PDF
  const downloadPDF = async () => {
    if (!displayEmployee) return;

    // Identify current month/year
    const currentStart = new Date(displayEmployee.startDate);
    const currentMonth = currentStart.getMonth();
    const currentYear = currentStart.getFullYear();

    // Collect last 3 months
    const monthsToGet = [0, 1, 2].map((i) => {
      const d = new Date(currentYear, currentMonth - i, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      };
    });

    // Find payroll records
    const records = monthsToGet.map(({ month, year, label }) => {
      const payroll = allPayroll.find(
        (p) =>
          p.employeeNumber === displayEmployee.employeeNumber &&
          new Date(p.startDate).getMonth() === month &&
          new Date(p.startDate).getFullYear() === year
      );
      return { payroll, label };
    });

    // PDF setup
    const pdf = new jsPDF('l', 'in', 'a4');
    pdf.setFont('Arial', 'bold'); // or ('helvetica', 'normal') / ('courier', 'italic')

    const contentWidth = 3.5;
    const contentHeight = 7.1;
    const gap = 0.2;

    const totalWidth = contentWidth * 3 + gap * 2;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const yOffset = (pageHeight - contentHeight) / 2;

    const positions = [
      (pageWidth - totalWidth) / 2,
      (pageWidth - totalWidth) / 2 + contentWidth + gap,
      (pageWidth - totalWidth) / 2 + (contentWidth + gap) * 2,
    ];

    // Render each slot
    for (let i = 0; i < records.length; i++) {
      const { payroll, label } = records[i];
      let imgData;

      if (payroll) {
        // Normal payslip
        setDisplayEmployee(payroll);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const input = payslipRef.current;
        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        imgData = canvas.toDataURL('image/png');
      } else {
        // No Data placeholder
        const placeholderCanvas = document.createElement('canvas');
        placeholderCanvas.width = 600;
        placeholderCanvas.height = 1200;
        const ctx = placeholderCanvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height);
        ctx.fillStyle = '#6D2323';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Data', placeholderCanvas.width / 2, 500);
        ctx.font = '20px Arial';
        ctx.fillText(`for ${label}`, placeholderCanvas.width / 2, 550);
        imgData = placeholderCanvas.toDataURL('image/png');
      }

      // Add to PDF
      pdf.addImage(
        imgData,
        'PNG',
        positions[i],
        yOffset,
        contentWidth,
        contentHeight
      );
    }

    // Save file
    pdf.save(`${displayEmployee.name || 'EARIST'}-Payslips-3Months.pdf`);

    // Show success overlay
    setModal({
      open: true,
      type: 'success',
      action: 'download',
    });

    // Restore state
    setDisplayEmployee(displayEmployee);
  };

  // For Search
  const handleSearch = () => {
    if (!search.trim()) return;

    const result = allPayroll.filter(
      (emp) =>
        emp.employeeNumber.toString().includes(search.trim()) ||
        emp.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (result.length > 0) {
      setFilteredPayroll(result);
      setDisplayEmployee(result[0]); // ✅ show first search match
      setHasSearched(true);
    } else {
      setFilteredPayroll([]);
      setDisplayEmployee(null); // clear display
      setSelectedMonth(''); // ✅ reset month filter
      setHasSearched(true);
    }
  };

  // For Clear / Reset
  const clearSearch = () => {
    setSearch('');
    setHasSearched(false);
    setSelectedMonth('');
    setFilteredPayroll([]);

    if (employee) {
      setDisplayEmployee(employee);
    } else if (allPayroll.length > 0) {
      setDisplayEmployee(allPayroll[0]);
    } else {
      setDisplayEmployee(null);
    }
  };

  // Month filter
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);

    const monthIndex = months.indexOf(month);

    const result = allPayroll.filter((emp) => {
      if (!emp.startDate) return false;
      const empMonth = new Date(emp.startDate).getMonth();
      return (
        emp.employeeNumber?.toString() === personID.toString() &&
        empMonth === monthIndex
      );
    });

    setFilteredPayroll(result);
    setDisplayEmployee(result.length > 0 ? result[0] : null);
    setHasSearched(true);
  };

  return (
    <Box sx={{ 
      py: 4,
      borderRadius: '14px',
      width: '100vw', // Full viewport width
      mx: 'auto', // Center horizontally
      maxWidth: '100%', // Ensure it doesn't exceed viewport
      overflow: 'hidden', // Prevent horizontal scroll
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)', // Center the element
    }}>
      {/* Wider Container */}
      <Box sx={{ px: 6, mx: 'auto', maxWidth: '1600px' }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard>
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: accentColor,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.1) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 150,
                    height: 150,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.08) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                
                <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        mr: 4, 
                        width: 64, // Reduced from 72
                        height: 64, // Reduced from 72
                        boxShadow: '0 8px 24px rgba(109,35,35,0.15)'
                      }}
                    >
                      <WorkIcon sx={{color: accentColor, fontSize: 32 }} /> {/* Reduced from 40 */}
                    </Avatar>
                    <Box>
                      {/* Changed from h3 to h4 for smaller title */}
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Employee Payslip Record
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        View and download employee payslip
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="System Generated" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                    <Tooltip title="Refresh Data">
                      <IconButton 
                        onClick={() => window.location.reload()}
                        sx={{ 
                          bgcolor: 'rgba(109,35,35,0.1)', 
                          '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                          color: accentColor,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: primaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Fetching payroll records...
            </Typography>
          </Box>
        </Backdrop>

        {error && (
          <Fade in timeout={300}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Controls */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={12}>
                  <ModernTextField
                    fullWidth
                    label="Employee Number"
                    value={personID}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: accentColor }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, borderColor: 'rgba(109,35,35,0.1)' }} />

              {/* Month Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Search sx={{ mr: 2, fontSize: 24 }} />
                  <b>Filter By Month:</b>
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(3, 1fr)",
                      sm: "repeat(6, 1fr)",
                      md: "repeat(12, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  {months.map((month) => (
                    <ProfessionalButton
                      key={month}
                      variant={month === selectedMonth ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleMonthSelect(month)}
                      sx={{
                        borderColor: accentColor,
                        color: month === selectedMonth ? primaryColor : accentColor,
                        minWidth: "auto",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        py: 1,
                        backgroundColor: month === selectedMonth ? accentColor : 'transparent',
                        "&:hover": {
                          backgroundColor: month === selectedMonth ? accentDark : alpha(accentColor, 0.1),
                        },
                      }}
                    >
                      {month}
                    </ProfessionalButton>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>

        {displayEmployee ? (
          <Fade in={!loading} timeout={500}>
            <GlassCard sx={{ mb: 4 }}>
              <Box sx={{ 
                p: 4, 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
                color: accentColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentDark }}>
                    Payslip Summary
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: accentColor }}>
                    {displayEmployee.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Chip 
                      label={`Employee #${displayEmployee.employeeNumber}`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500
                      }} 
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8, color: accentDark }}>
                      {(() => {
                        if (!displayEmployee.startDate || !displayEmployee.endDate) return '—';
                        const start = new Date(displayEmployee.startDate);
                        const end = new Date(displayEmployee.endDate);
                        const month = start.toLocaleString('en-US', { month: 'long' }).toUpperCase();
                        return `${month} ${start.getDate()}-${end.getDate()} ${end.getFullYear()}`;
                      })()}
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(109,35,35,0.15)', 
                    width: 80, 
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: accentColor
                  }}
                >
                  {displayEmployee.name ? displayEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'E'}
                </Avatar>
              </Box>

              <Paper
                ref={payslipRef}
                elevation={4}
                sx={{
                  p: 3,
                  mt: 2,
                  border: '2px solid black',
                  borderRadius: 1,
                  backgroundColor: '#fff',
                  fontFamily: 'Arial, sans-serif',
                  position: 'relative', // ✅ important for watermark positioning
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={hrisLogo}
                  alt="Watermark"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.07, // ✅ makes it faint like a watermark
                    width: '100%', // adjust size as needed
                    pointerEvents: 'none', // ✅ so it doesn't block clicks/selections
                    userSelect: 'none',
                  }}
                />
                {/* Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                  sx={{
                    background: 'linear-gradient(to right, #6d2323, #a31d1d)',
                    borderRadius: '2px',
                  }}
                >
                  {/* Left Logo */}
                  <Box>
                    <img
                      src={logo}
                      alt="Logo"
                      style={{ width: '60px', marginLeft: '10px' }}
                    />
                  </Box>

                  {/* Center Text */}
                  <Box textAlign="center" flex={1} sx={{ color: 'white' }}>
                    <Typography variant="subtitle2" sx={{ fontStyle: 'italic' }}>
                      Republic of the Philippines
                    </Typography>
                    <Typography
                      variant="subtitle5"
                      fontWeight="bold"
                      sx={{ ml: '25px' }}
                    >
                      EULOGIO "AMANG" RODRIGUEZ INSTITUTE OF SCIENCE AND TECHNOLOGY
                    </Typography>
                    <Typography variant="body2">Nagtahan, Sampaloc Manila</Typography>
                  </Box>

                  {/* Right Logo */}
                  <Box>
                    <img src={hrisLogo} alt="HRIS Logo" style={{ width: '80px' }} />
                  </Box>
                </Box>

                {/* Rows */}
                <Box sx={{ border: '2px solid black', borderBottom: '0px' }}>
                  {/* Row template */}
                  {[
                    {
                      label: 'PERIOD:',
                      value: (
                        <span style={{ fontWeight: 'bold' }}>
                          {(() => {
                            if (
                              !displayEmployee.startDate ||
                              !displayEmployee.endDate
                            )
                              return '—';
                            const start = new Date(displayEmployee.startDate);
                            const end = new Date(displayEmployee.endDate);
                            const month = start
                              .toLocaleString('en-US', { month: 'long' })
                              .toUpperCase();
                            return `${month} ${start.getDate()}-${end.getDate()} ${end.getFullYear()}`;
                          })()}
                        </span>
                      ),
                    },
                    {
                      label: 'EMPLOYEE NUMBER:',
                      value: (
                        <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
                          {displayEmployee.employeeNumber &&
                          parseFloat(displayEmployee.employeeNumber) !== 0
                            ? `${parseFloat(displayEmployee.employeeNumber)}`
                            : ''}
                        </Typography>
                      ),
                    },
                    {
                      label: 'NAME:',
                      value: (
                        <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
                          {displayEmployee.name ? `${displayEmployee.name}` : ''}
                        </Typography>
                      ),
                    },

                    {
                      label: 'GROSS SALARY:',
                      value:
                        displayEmployee.grossSalary &&
                        parseFloat(displayEmployee.grossSalary) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.grossSalary
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'Rendered Days:',
                      value:
                        displayEmployee.rh && parseFloat(displayEmployee.rh) !== 0
                          ? (() => {
                              const totalHours = Number(displayEmployee.rh);
                              const days = Math.floor(totalHours / 8);
                              const hours = totalHours % 8;
                              return `${days} days${
                                hours > 0 ? ` & ${hours} hrs` : ''
                              }`;
                            })()
                          : '',
                    },

                    {
                      label: 'ABS:',
                      value:
                        displayEmployee.abs && parseFloat(displayEmployee.abs) !== 0
                          ? `₱${parseFloat(displayEmployee.abs).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'WITHHOLDING TAX:',
                      value:
                        displayEmployee.withholdingTax &&
                        parseFloat(displayEmployee.withholdingTax) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.withholdingTax
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'L.RET:',
                      value:
                        displayEmployee.personalLifeRetIns &&
                        parseFloat(displayEmployee.personalLifeRetIns) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.personalLifeRetIns
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'GSIS SALARY LOAN:',
                      value:
                        displayEmployee.gsisSalaryLoan &&
                        parseFloat(displayEmployee.gsisSalaryLoan) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.gsisSalaryLoan
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'POLICY:',
                      value:
                        displayEmployee.gsisPolicyLoan &&
                        parseFloat(displayEmployee.gsisPolicyLoan) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.gsisPolicyLoan
                            ).toLocaleString()}`
                          : '',
                    },

                    {
                      label: 'HOUSING LOAN:',
                      value:
                        displayEmployee.gsisHousingLoan &&
                        parseFloat(displayEmployee.gsisHousingLoan) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.gsisHousingLoan
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'GSIS ARREARS:',
                      value:
                        displayEmployee.gsisArrears &&
                        parseFloat(displayEmployee.gsisArrears) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.gsisArrears
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'GFAL:',
                      value:
                        displayEmployee.gfal && parseFloat(displayEmployee.gfal) !== 0
                          ? `₱${parseFloat(displayEmployee.gfal).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'CPL:',
                      value:
                        displayEmployee.cpl && parseFloat(displayEmployee.cpl) !== 0
                          ? `₱${parseFloat(displayEmployee.cpl).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'MPL:',
                      value:
                        displayEmployee.mpl && parseFloat(displayEmployee.mpl) !== 0
                          ? `₱${parseFloat(displayEmployee.mpl).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'MPL LITE:',
                      value:
                        displayEmployee.mplLite &&
                        parseFloat(displayEmployee.mplLite) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.mplLite
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'ELA:',
                      value:
                        displayEmployee.ela && parseFloat(displayEmployee.ela) !== 0
                          ? `₱${parseFloat(displayEmployee.ela).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'SSS:',
                      value:
                        displayEmployee.sss && parseFloat(displayEmployee.sss) !== 0
                          ? `₱${parseFloat(displayEmployee.sss).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'PAG-IBIG:',
                      value:
                        displayEmployee.pagibigFundCont &&
                        parseFloat(displayEmployee.pagibigFundCont) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.pagibigFundCont
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'MPL:',
                      value:
                        displayEmployee.mpl && parseFloat(displayEmployee.mpl) !== 0
                          ? `₱${parseFloat(displayEmployee.mpl).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'PHILHEALTH:',
                      value:
                        displayEmployee.PhilHealthContribution &&
                        parseFloat(displayEmployee.PhilHealthContribution) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.PhilHealthContribution
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: "PHILHEALTH (DIFF'L):",
                      value:
                        displayEmployee.philhealthDiff &&
                        parseFloat(displayEmployee.philhealthDiff) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.philhealthDiff
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'PAG-IBIG 2:',
                      value:
                        displayEmployee.pagibig2 &&
                        parseFloat(displayEmployee.pagibig2) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.pagibig2
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'LBP LOAN:',
                      value:
                        displayEmployee.lbpLoan &&
                        parseFloat(displayEmployee.lbpLoan) !== 0
                          ? `₱${parseFloat(displayEmployee.lbpLoan).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'MTSLAI:',
                      value:
                        displayEmployee.mtslai &&
                        parseFloat(displayEmployee.mtslai) !== 0
                          ? `₱${parseFloat(displayEmployee.mtslai).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'ECC:',
                      value:
                        displayEmployee.ecc && parseFloat(displayEmployee.ecc) !== 0
                          ? `₱${parseFloat(displayEmployee.ecc).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'TO BE REFUNDED:',
                      value:
                        displayEmployee.toBeRefunded &&
                        parseFloat(displayEmployee.toBeRefunded) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.toBeRefunded
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'FEU:',
                      value:
                        displayEmployee.feu && parseFloat(displayEmployee.feu) !== 0
                          ? `₱${parseFloat(displayEmployee.feu).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'ESLAI:',
                      value:
                        displayEmployee.eslai &&
                        parseFloat(displayEmployee.eslai) !== 0
                          ? `₱${parseFloat(displayEmployee.eslai).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'TOTAL DEDUCTIONS:',
                      value:
                        displayEmployee.totalDeductions &&
                        parseFloat(displayEmployee.totalDeductions) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.totalDeductions
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: 'NET SALARY:',
                      value:
                        displayEmployee.netSalary &&
                        parseFloat(displayEmployee.netSalary) !== 0
                          ? `₱${parseFloat(
                              displayEmployee.netSalary
                            ).toLocaleString()}`
                          : '',
                    },
                    {
                      label: '1ST QUINCENA:',
                      value:
                        displayEmployee.pay1st &&
                        parseFloat(displayEmployee.pay1st) !== 0
                          ? `₱${parseFloat(displayEmployee.pay1st).toLocaleString()}`
                          : '',
                    },
                    {
                      label: '2ND QUINCENA:',
                      value:
                        displayEmployee.pay2nd &&
                        parseFloat(displayEmployee.pay2nd) !== 0
                          ? `₱${parseFloat(displayEmployee.pay2nd).toLocaleString()}`
                          : '',
                    },
                  ].map((row, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        borderBottom: '1px solid black', // ✅ always show border
                      }}
                    >
                      {/* Left column (label) */}
                      <Box sx={{ p: 1, width: '25%' }}>
                        <Typography fontWeight="bold">{row.label}</Typography>
                      </Box>

                      {/* Right column (value with left border) */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 1,
                          borderLeft: '1px solid black',
                        }}
                      >
                        <Typography>{row.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Footer */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                  sx={{ fontSize: '0.85rem' }}
                >
                  <Typography>Certified Correct:</Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    GIOVANNI L. AHUNIN
                  </Typography>
                </Box>
                <Typography>Director, Administrative Services</Typography>
              </Paper>
            </GlassCard>
          </Fade>
        ) : selectedMonth ? (
          <Fade in timeout={500}>
            <GlassCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(109,35,35,0.15)', 
                    mx: 'auto', 
                    mb: 2,
                    width: 80, 
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: accentColor
                  }}
                >
                  <Search sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" color={accentColor} gutterBottom sx={{ fontWeight: 600 }}>
                  No Payslip Found
                </Typography>
                <Typography variant="body1" color={accentDark}>
                  There's no payslip saved for the month of <b>{selectedMonth}.</b>
                </Typography>
              </CardContent>
            </GlassCard>
          </Fade>
        ) : hasSearched ? (
          <Fade in timeout={500}>
            <GlassCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(109,35,35,0.15)', 
                    mx: 'auto', 
                    mb: 2,
                    width: 80, 
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: accentColor
                  }}
                >
                  <Search sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" color={accentColor} gutterBottom sx={{ fontWeight: 600 }}>
                  Select a Month
                </Typography>
                <Typography variant="body1" color={accentDark}>
                  Please select a month to view your payslip.
                </Typography>
              </CardContent>
            </GlassCard>
          </Fade>
        ) : null}

        {/* Download Button */}
        {displayEmployee && (
          <Fade in timeout={900}>
            <GlassCard>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(primaryColor, 0.8), color: accentColor }}>
                      <Download />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ color: accentDark }}>
                        Download your payslip as PDF
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ 
                  bgcolor: alpha(primaryColor, 0.5), 
                  pb: 2,
                  borderBottom: '1px solid rgba(109,35,35,0.1)'
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <ProfessionalButton
                  variant="contained"
                  fullWidth
                  startIcon={<Download />}
                  onClick={downloadPDF}
                  sx={{
                    py: 2,
                    bgcolor: accentColor,
                    color: primaryColor,
                    fontSize: '1rem',
                    '&:hover': {
                      bgcolor: accentDark,
                    }
                  }}
                >
                  Download Payslip | PDF
                </ProfessionalButton>
              </CardContent>
            </GlassCard>
          </Fade>
        )}
      </Box>
      
      <Dialog
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
      >
        <SuccessfulOverlay
          open={modal.open && modal.type === 'success'}
          action={modal.action}
          onClose={() => setModal({ ...modal, open: false })}
        />

        {modal.type === 'error' && (
          <div style={{ color: 'red', padding: '20px' }}>
            {modal.message || 'An error occurred'}
          </div>
        )}
      </Dialog>
    </Box>
  );
});

export default Payslip;