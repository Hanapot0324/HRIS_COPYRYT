import API_BASE_URL from '../../apiConfig';
import React, { useRef, forwardRef, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Select,
  MenuItem,
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
  Grid,
  InputAdornment,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import Search from '@mui/icons-material/Search';
import Refresh from '@mui/icons-material/Refresh';
import Send from '@mui/icons-material/Send';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import logo from '../../assets/logo.png';
import hrisLogo from '../../assets/hrisLogo.png';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';

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

const PremiumTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(109, 35, 35, 0.06)',
  border: '1px solid rgba(109, 35, 35, 0.08)',
}));

const PremiumTableCell = styled(TableCell)(({ theme, isHeader = false }) => ({
  fontWeight: isHeader ? 600 : 500,
  padding: '18px 20px',
  borderBottom: isHeader ? '2px solid rgba(254, 249, 225, 0.5)' : '1px solid rgba(109, 35, 35, 0.06)',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
}));

const PayslipDistribution = forwardRef(({ employee }, ref) => {
  const payslipRef = ref || useRef();

  const [allPayroll, setAllPayroll] = useState([]);
  const [displayEmployee, setDisplayEmployee] = useState(employee || null);
  const [loading, setLoading] = useState(!employee);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successOverlay, setSuccessOverlay] = useState({
    open: false,
    action: '',
  });
  const [modal, setModal] = useState({
    open: false,
    type: 'error',
    message: '',
  });

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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

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

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fetch payroll
  useEffect(() => {
    if (!employee) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE_URL}/PayrollReleasedRoute/released-payroll-detailed`,
            getAuthHeaders()
          );
          setAllPayroll(res.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching payroll:', err);
          setError('Failed to fetch payroll data. Please try again.');
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [employee]);

  // Filter payroll by Year, Month, and Search
  useEffect(() => {
    let result = [...allPayroll];

    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      result = result.filter((emp) => {
        if (!emp.startDate) return false;
        const date = new Date(emp.startDate);
        return (
          date.getMonth() === monthIndex && date.getFullYear() === selectedYear
        );
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.employeeNumber.toString().includes(q)
      );
    }

    setFilteredPayroll(result);
    setSelectedEmployees([]); // reset selection when filters change
  }, [selectedMonth, selectedYear, searchQuery, allPayroll]);

  // Month select
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setDisplayEmployee(null);
  };

  // Checkbox logic
  const allSelected =
    filteredPayroll.length > 0 &&
    selectedEmployees.length === filteredPayroll.length;
  const someSelected =
    selectedEmployees.length > 0 &&
    selectedEmployees.length < filteredPayroll.length;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedEmployees(filteredPayroll.map((emp) => emp.employeeNumber));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  // Helper function to generate 3-month PDF for an employee
  const generate3MonthPDF = async (employee) => {
    // 1. Identify current month/year from employee
    const currentStart = new Date(employee.startDate);
    const currentMonth = currentStart.getMonth(); // 0-11
    const currentYear = currentStart.getFullYear();

    // 2. Collect last 3 months (current, prev, prev-1)
    const monthsToGet = [0, 1, 2].map((i) => {
      const d = new Date(currentYear, currentMonth - i, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      };
    });

    // 3. Find payroll records (or null if missing)
    const records = monthsToGet.map(({ month, year, label }) => {
      const payroll = allPayroll.find(
        (p) =>
          p.employeeNumber === employee.employeeNumber &&
          new Date(p.startDate).getMonth() === month &&
          new Date(p.startDate).getFullYear() === year
      );
      return { payroll, label };
    });

    // 4. PDF setup - landscape orientation for 3 payslips
    const pdf = new jsPDF('l', 'in', 'a4');
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

    // 5. Render each of the 3 slots
    for (let i = 0; i < records.length; i++) {
      const { payroll, label } = records[i];
      let imgData;

      if (payroll) {
        // Normal payslip
        setDisplayEmployee(payroll);
        await new Promise((resolve) => setTimeout(resolve, 500)); // wait DOM update

        const input = payslipRef.current;
        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        imgData = canvas.toDataURL('image/png');
      } else {
        // Missing → create "No Data" placeholder
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

    return pdf.output('blob');
  };

  // Bulk send selected payslips with 3-month layout
  const sendSelectedPayslips = async () => {
    if (selectedEmployees.length === 0) return;

    setSending(true);
    setLoadingMessage('Generating payslips and sending via Gmail...');

    try {
      const formData = new FormData();
      let payslipMeta = [];

      // Update loading message for processing
      setLoadingMessage(
        `Processing ${selectedEmployees.length} employee payslips...`
      );

      for (const emp of filteredPayroll.filter((e) =>
        selectedEmployees.includes(e.employeeNumber)
      )) {
        // Update loading message for current employee
        setLoadingMessage(`Generating payslip for ${emp.name}...`);

        // Generate 3-month PDF for this employee
        const pdfBlob = await generate3MonthPDF(emp);
        formData.append('pdfs', pdfBlob, `${emp.name}_3month_payslip.pdf`);

        payslipMeta.push({
          name: emp.name,
          employeeNumber: emp.employeeNumber,
        });
      }

      // Update loading message for sending
      setLoadingMessage('Sending payslips via Gmail...');

      formData.append('payslips', JSON.stringify(payslipMeta));

      await axios.post(`${API_BASE_URL}/SendPayslipRoute/send-bulk`, formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success overlay
      setSending(false);
      setSuccessOverlay({
        open: true,
        action: 'gmail',
      });
    } catch (err) {
      console.error('Error sending bulk payslips:', err);
      setSending(false);
      setModal({
        open: true,
        type: 'error',
        message: 'An error occurred while sending bulk payslips.',
      });
    }
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
                        Employee Payslip Distribution
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Manage and distribute monthly employee payslip records
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
                <Grid item xs={12} md={6}>
                  <ModernTextField
                    fullWidth
                    label="Search by Name or Employee Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: accentColor }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ModernTextField
                    fullWidth
                    select
                    label="Year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    SelectProps={{
                      native: false,
                    }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </ModernTextField>
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

        {/* Employee Table */}
        {selectedMonth && (
          <Fade in timeout={900}>
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
                    Employee List
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: accentColor }}>
                    {selectedMonth} {selectedYear}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Chip 
                      label={`${filteredPayroll.length} Employees`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500
                      }} 
                    />
                    <Chip 
                      label={`${selectedEmployees.length} Selected`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500
                      }} 
                    />
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
                  {selectedMonth ? selectedMonth.substring(0, 1) : 'E'}
                </Avatar>
              </Box>

              <PremiumTableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: alpha(primaryColor, 0.7) }}>
                    <TableRow>
                      <PremiumTableCell isHeader sx={{ color: accentColor, width: '80px' }}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={handleSelectAll}
                          sx={{ color: accentColor }}
                        />
                      </PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor }}>Name</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor }}>Employee Number</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor }}>Payslip Status</PremiumTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayroll.length > 0 ? (
                      filteredPayroll.map((emp) => {
                        const hasPayslip = !!emp.startDate;
                        return (
                          <TableRow 
                            key={emp.employeeNumber}
                            sx={{ 
                              '&:nth-of-type(even)': { bgcolor: alpha(primaryColor, 0.3) },
                              '&:hover': { bgcolor: alpha(accentColor, 0.05) },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <PremiumTableCell>
                              <Checkbox
                                checked={selectedEmployees.includes(emp.employeeNumber)}
                                onChange={() => handleSelectOne(emp.employeeNumber)}
                                sx={{ color: accentColor }}
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>{emp.name}</PremiumTableCell>
                            <PremiumTableCell>{emp.employeeNumber}</PremiumTableCell>
                            <PremiumTableCell>
                              {hasPayslip ? (
                                <Chip 
                                  label="Available" 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(76, 175, 80, 0.15)', 
                                    color: '#2e7d32',
                                    fontWeight: 500
                                  }} 
                                />
                              ) : (
                                <Chip 
                                  label="No Data" 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(244, 67, 54, 0.15)', 
                                    color: '#c62828',
                                    fontWeight: 500
                                  }} 
                                />
                              )}
                            </PremiumTableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                          <Box sx={{ textAlign: 'center' }}>
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
                              No Employee Data Found
                            </Typography>
                            <Typography variant="body1" color={accentDark}>
                              Try adjusting your search filters or selecting a different month/year
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </PremiumTableContainer>
            </GlassCard>
          </Fade>
        )}

        {/* Bulk Send Button */}
        {selectedMonth && filteredPayroll.length > 0 && (
          <Fade in timeout={1100}>
            <GlassCard>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(primaryColor, 0.8), color: accentColor }}>
                      <Send />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ color: accentDark }}>
                        Send payslips to selected employees via Gmail
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
                  startIcon={<Send />}
                  onClick={sendSelectedPayslips}
                  disabled={sending || selectedEmployees.length === 0}
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
                  Distribute Monthly Payslips
                </ProfessionalButton>
              </CardContent>
            </GlassCard>
          </Fade>
        )}

        {sending && (
          <LoadingOverlay
            open={sending}
            message={loadingMessage || 'Processing...'}
          />
        )}
        {successOverlay.open && (
          <SuccessfulOverlay
            open={successOverlay.open}
            action={successOverlay.action}
            onClose={() => setSuccessOverlay({ open: false, action: '' })}
          />
        )}

        {/* Hidden Payslip Renderer - Updated with new layout */}
        {displayEmployee && (
          <Paper
            ref={payslipRef}
            elevation={4}
            sx={{
              p: 3,
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              mt: 2,
              border: '2px solid black',
              borderRadius: 1,
              backgroundColor: '#fff',
              fontFamily: 'Arial, sans-serif',
              overflow: 'hidden',
            }}
          >
            {/* Watermark */}
            <Box
              component="img"
              src={hrisLogo}
              alt="Watermark"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.07,
                width: '100%',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />

            {/* Header - Updated with gradient background and dual logos */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              sx={{
                background: 'linear-gradient(to right, #6d2323, #a31d1d)',
                borderRadius: '2px',
                p: 1,
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
                  label: 'SSS:',
                  value:
                    displayEmployee.sss && parseFloat(displayEmployee.sss) !== 0
                      ? `₱${parseFloat(displayEmployee.sss).toLocaleString()}`
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
                    borderBottom: '1px solid black',
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
              <Typography>plus PERA — 2,000.00</Typography>
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
        )}

        {/* Modal */}
        <Dialog
          open={modal.open}
          onClose={() => setModal({ ...modal, open: false })}
        >
          <DialogTitle>
            {/* ✅ Custom success overlay */}
            <SuccessfulOverlay
              open={modal.open && modal.type === 'success'}
              action={modal.action}
              onClose={() => setModal({ ...modal, open: false })}
            />

            {/* ❌ Error fallback */}
            {modal.type === 'error' && (
              <div style={{ color: 'red', fontWeight: 'bold' }}>❌ Error</div>
            )}
          </DialogTitle>

          <DialogContent>
            <Typography>{modal.message}</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setModal({ ...modal, open: false })} autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
});

export default PayslipDistribution;