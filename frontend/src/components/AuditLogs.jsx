import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Tooltip,
  Avatar,
  Fade,
  Backdrop,
  styled,
  alpha,
  Breadcrumbs,
  Link,
  CardHeader,
  TablePagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import {
  Reorder as ReorderIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Home,
  Security,
  FilterList,
  Refresh,
  CheckCircle,
  Error,
  Info,
  Warning,
  Assessment,
  Edit,
  Delete,
  Save,
  Cancel,
  SupervisorAccount,
  AdminPanelSettings,
  Work,
  Person,
} from '@mui/icons-material';
import LoadingOverlay from './LoadingOverlay'; // Adjust path as needed

// Professional styled components matching PagesList.jsx EXACTLY
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

const ProfessionalButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 12,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
  boxShadow:
    variant === 'contained' ? '0 4px 14px rgba(109, 35, 35, 0.25)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow:
      variant === 'contained' ? '0 6px 20px rgba(109, 35, 35, 0.35)' : 'none',
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
      boxShadow: '0 4px 20px rgba(109, 35, 35, 0.25)',
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
  borderBottom: isHeader
    ? '2px solid rgba(109, 35, 35, 0.3)'
    : '1px solid rgba(109, 35, 35, 0.06)',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
}));

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState('');

  const HARDCODED_PASSWORD = '20134507';
  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  // Color scheme matching PagesList.jsx EXACTLY
  const primaryColor = '#FEF9E1';
  const secondaryColor = '#FFF8E7';
  const accentColor = '#6d2323';
  const accentDark = '#8B3333';

  // Check if session is still valid
  const isSessionValid = () => {
    const sessionData = sessionStorage.getItem('auditLogsSession');
    if (!sessionData) return false;
    
    try {
      const { timestamp } = JSON.parse(sessionData);
      const now = Date.now();
      const sessionAge = now - timestamp;
      
      return sessionAge < SESSION_DURATION;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return false;
    }
  };

  // Store session data
  const storeSession = () => {
    const sessionData = {
      timestamp: Date.now(),
      authenticated: true
    };
    sessionStorage.setItem('auditLogsSession', JSON.stringify(sessionData));
  };

  // Clear session data
  const clearSession = () => {
    sessionStorage.removeItem('auditLogsSession');
    setIsAuthenticated(false);
    setPasswordDialogOpen(true);
  };

  // Get remaining session time in minutes
  const getRemainingSessionTime = () => {
    const sessionData = sessionStorage.getItem('auditLogsSession');
    if (!sessionData) return 0;
    
    try {
      const { timestamp } = JSON.parse(sessionData);
      const now = Date.now();
      const sessionAge = now - timestamp;
      const remaining = SESSION_DURATION - sessionAge;
      
      return Math.max(0, Math.floor(remaining / (60 * 1000))); // Convert to minutes
    } catch (error) {
      return 0;
    }
  };

  // Check session validity periodically and update remaining time
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      if (!isSessionValid()) {
        clearSession();
        setPasswordError('Session expired. Please enter password again.');
      } else {
        setRemainingTime(getRemainingSessionTime());
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Update remaining time every minute
  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setInterval(() => {
      setRemainingTime(getRemainingSessionTime());
    }, 60000); // Update every minute

    // Initial update
    setRemainingTime(getRemainingSessionTime());

    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  useEffect(() => {
    // Check if there's a valid session on component mount
    if (isSessionValid()) {
      setIsAuthenticated(true);
      setPasswordDialogOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (passwordInput === HARDCODED_PASSWORD) {
      setPasswordError('');
      setPasswordDialogOpen(false);
      setIsAuthenticated(true);
      setLoadingMessage('Verifying access...');
      setLoading(true);

      // Store session data
      storeSession();

      // Simulate verification delay
      setTimeout(() => {
        setLoadingMessage('Loading audit logs...');
      }, 1500);
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleCloseDialog = () => {
    setPasswordDialogOpen(false);
    navigate('/admin-home'); // Navigate back to home page
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/audit-logs`, getAuthHeaders());
      setLogs(response.data);

      // Simulate loading delay
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
        setRefreshing(false);
        
        if (refreshing && logs.length > 0) {
          setSuccessMessage('Audit logs refreshed successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      }, 2000);
    } catch (err) {
      console.error('Error fetching audit logs:', err.response?.data || err.message);
      setLoading(false);
      setLoadingMessage('');
      setRefreshing(false);
      setErrorMessage('Failed to fetch audit logs');
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('Authentication failed. Please log in again.');
        // Optionally redirect to login or show error message
      }
    }
  };

  // Get unique months from logs for filter dropdown
  const getUniqueMonths = () => {
    const months = logs
      .map((log) => {
        if (log.timestamp) {
          const date = new Date(log.timestamp);
          return {
            value: `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}`,
            label: date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
            }),
          };
        }
        return null;
      })
      .filter(Boolean)
      .reduce((unique, month) => {
        if (!unique.some((m) => m.value === month.value)) {
          unique.push(month);
        }
        return unique;
      }, [])
      .sort((a, b) => b.value.localeCompare(a.value)); // Sort newest first

    return months;
  };

  // Filter logs based on search query and selected month
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.record_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetEmployeeNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesMonth =
      !selectedMonth ||
      (log.timestamp && log.timestamp.startsWith(selectedMonth));

    return matchesSearch && matchesMonth;
  });

  // Pagination logic
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearMonth = () => {
    setSelectedMonth('');
    setPage(0);
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return {
          sx: { bgcolor: alpha('#4caf50', 0.15), color: '#2e7d32' },
          icon: <CheckCircle />,
        };
      case 'update':
        return {
          sx: { bgcolor: alpha('#ff9800', 0.15), color: '#e65100' },
          icon: <Edit />,
        };
      case 'delete':
        return {
          sx: { bgcolor: alpha('#f44336', 0.15), color: '#c62828' },
          icon: <Delete />,
        };
      default:
        return {
          sx: { bgcolor: alpha(accentColor, 0.15), color: accentColor },
          icon: <Info />,
        };
    }
  };

  // Show password dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog
        open={passwordDialogOpen}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: primaryColor,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 100%)`,
            color: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <LockIcon sx={{ mr: 1 }} />
            Audit Logs Access
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: primaryColor,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center', color: accentColor }}
          >
            This section contains sensitive audit information. Please enter the
            access password.
          </Typography>
          <ModernTextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Access Password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: alpha(primaryColor, 0.5) }}>
          <ProfessionalButton
            onClick={handlePasswordSubmit}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: accentColor,
              color: primaryColor,
              '&:hover': { bgcolor: accentDark },
            }}
          >
            Access Audit Logs
          </ProfessionalButton>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <LoadingOverlay open={loading} message={loadingMessage} />

      <Box
        sx={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentDark} 50%, ${accentColor} 100%)`,
          py: 4,
          borderRadius: '14px',
          width: '100vw',
          mx: 'auto',
          maxWidth: '100%',
          overflow: 'hidden',
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
          minHeight: '92vh',
        }}
      >
        <Box sx={{ px: 6, mx: 'auto', maxWidth: '1600px' }}>
          {/* Breadcrumbs */}
          <Fade in timeout={300}>
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.9rem' }}>
                <Link
                  underline="hover"
                  color="inherit"
                  href="/dashboard"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: primaryColor,
                  }}
                >
                  <Home sx={{ mr: 0.5, fontSize: 20 }} />
                  Dashboard
                </Link>
                <Typography
                  color="text.primary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 600,
                    color: primaryColor,
                  }}
                >
                  <Assessment sx={{ mr: 0.5, fontSize: 20 }} />
                  Audit Logs
                </Typography>
              </Breadcrumbs>
            </Box>
          </Fade>

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
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      background:
                        'radial-gradient(circle, rgba(109,35,35,0.1) 0%, rgba(109,35,35,0) 70%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: '30%',
                      width: 150,
                      height: 150,
                      background:
                        'radial-gradient(circle, rgba(109,35,35,0.08) 0%, rgba(109,35,35,0) 70%)',
                    }}
                  />

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    position="relative"
                    zIndex={1}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(109,35,35,0.15)',
                          mr: 4,
                          width: 64,
                          height: 64,
                          boxShadow: '0 8px 24px rgba(109,35,35,0.15)',
                        }}
                      >
                        <ReorderIcon sx={{ fontSize: 32, color: accentColor }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="h1"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            lineHeight: 1.2,
                            color: accentColor,
                          }}
                        >
                          Audit Logs
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            opacity: 0.8,
                            fontWeight: 400,
                            color: accentDark,
                          }}
                        >
                          View all recorded system activities
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Session Info and Logout */}
                    <Box display="flex" alignItems="center" gap={2}>
                      {remainingTime > 0 && (
                        <Chip
                          label={`Session expires in: ${remainingTime} min`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(109,35,35,0.15)',
                            color: accentColor,
                            fontWeight: 500,
                          }}
                        />
                      )}
                      <Tooltip title="Refresh Logs">
                        <IconButton
                          onClick={fetchLogs}
                          disabled={loading}
                          sx={{
                            bgcolor: 'rgba(109,35,35,0.1)',
                            '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                            color: accentColor,
                            width: 48,
                            height: 48,
                            '&:disabled': {
                              bgcolor: 'rgba(109,35,35,0.05)',
                              color: 'rgba(109,35,35,0.3)',
                            },
                          }}
                        >
                          {loading ? (
                            <CircularProgress
                              size={24}
                              sx={{ color: accentColor }}
                            />
                          ) : (
                            <Refresh />
                          )}
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        onClick={() => navigate('/')}
                        sx={{
                          color: accentColor,
                          '&:hover': {
                            backgroundColor: 'rgba(109, 35, 35, 0.1)',
                          },
                        }}
                      >
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          </Fade>

          {/* Success/Error Messages */}
          {successMessage && (
            <Fade in timeout={300}>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  '& .MuiAlert-message': { fontWeight: 500 },
                }}
                icon={<CheckCircle />}
                onClose={() => setSuccessMessage('')}
              >
                {successMessage}
              </Alert>
            </Fade>
          )}

          {errorMessage && (
            <Fade in timeout={300}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  '& .MuiAlert-message': { fontWeight: 500 },
                }}
                icon={<Error />}
                onClose={() => setErrorMessage('')}
              >
                {errorMessage}
              </Alert>
            </Fade>
          )}

          {/* Search & Filter */}
          <Fade in timeout={700}>
            <GlassCard sx={{ mb: 4 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(primaryColor, 0.8),
                        color: accentColor,
                      }}
                    >
                      <FilterList />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{ fontWeight: 600, color: accentColor }}
                      >
                        Search & Filter
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ color: accentDark }}
                      >
                        Find and filter audit logs by various criteria
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  bgcolor: alpha(primaryColor, 0.5),
                  pb: 2,
                  borderBottom: '1px solid rgba(109,35,35,0.1)',
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <ModernTextField
                      fullWidth
                      label="Search Logs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by employee number, action, table name..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: accentColor }} />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClearSearch}
                              sx={{ color: accentColor }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel
                        sx={{
                          fontWeight: 500,
                          color: accentColor,
                          '&.Mui-focused': { color: accentColor },
                        }}
                      >
                        Filter by Month
                      </InputLabel>
                      <Select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          setPage(0);
                        }}
                        label="Filter by Month"
                        sx={{
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 20px rgba(109, 35, 35, 0.25)',
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(accentColor, 0.3),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(accentColor, 0.5),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: accentColor,
                          },
                        }}
                      >
                        <MenuItem value="">All Months</MenuItem>
                        {getUniqueMonths().map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {selectedMonth && (
                        <FormHelperText sx={{ color: alpha(accentColor, 0.7), fontSize: '0.8rem' }}>
                          <Button
                            size="small"
                            onClick={handleClearMonth}
                            sx={{ p: 0, minWidth: 'auto', color: accentColor }}
                          >
                            Clear filter
                          </Button>
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>
          </Fade>

          {/* Loading Backdrop */}
          <Backdrop
            sx={{
              color: primaryColor,
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={loading && !refreshing}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color="inherit" size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
                Loading audit logs...
              </Typography>
            </Box>
          </Backdrop>

          {/* Logs Table */}
          {!loading && (
            <Fade in timeout={900}>
              <GlassCard>
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(109,35,35,0.1)',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: accentColor }}
                    >
                      Audit Logs
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8, color: accentDark }}
                    >
                      {searchQuery || selectedMonth
                        ? `Showing ${filteredLogs.length} of ${logs.length} logs matching your criteria`
                        : `Total: ${logs.length} audit logs`}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${logs.length} Total Records`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(109,35,35,0.15)',
                      color: accentColor,
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <PremiumTableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: alpha(primaryColor, 0.7) }}>
                      <TableRow>
                        <PremiumTableCell isHeader sx={{ color: accentColor }}>
                          Employee Number
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: accentColor }}>
                          Action
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: accentColor }}>
                          Table Name
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: accentColor }}>
                          Target Employee
                        </PremiumTableCell>
                        <PremiumTableCell isHeader sx={{ color: accentColor }}>
                          Timestamp
                        </PremiumTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{ textAlign: 'center', py: 8 }}
                          >
                            <Box sx={{ textAlign: 'center' }}>
                              <Info
                                sx={{
                                  fontSize: 80,
                                  color: alpha(accentColor, 0.3),
                                  mb: 3,
                                }}
                              />
                              <Typography
                                variant="h5"
                                color={alpha(accentColor, 0.6)}
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                No Logs Found
                              </Typography>
                              <Typography
                                variant="body1"
                                color={alpha(accentColor, 0.4)}
                              >
                                {searchQuery || selectedMonth
                                  ? 'Try adjusting your search criteria or filters'
                                  : 'No audit logs available'}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLogs.map((log, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:nth-of-type(even)': {
                                bgcolor: alpha(primaryColor, 0.3),
                              },
                              '&:hover': { bgcolor: alpha(accentColor, 0.05) },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <PremiumTableCell sx={{ fontWeight: 600, color: accentColor }}>
                              {log.employeeNumber || '-'}
                            </PremiumTableCell>
                            <PremiumTableCell>
                              {log.action ? (
                                <Chip
                                  label={log.action}
                                  size="small"
                                  icon={getActionColor(log.action).icon}
                                  sx={{
                                    ...getActionColor(log.action).sx,
                                    fontWeight: 600,
                                    padding: '4px 8px',
                                  }}
                                />
                              ) : (
                                '-'
                              )}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ color: accentDark }}>
                              {log.table_name || '-'}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ color: accentDark }}>
                              {log.targetEmployeeNumber || '-'}
                            </PremiumTableCell>
                            <PremiumTableCell sx={{ color: accentDark }}>
                              <Typography variant="body2">
                                {formatDateForDisplay(log.timestamp)}
                              </Typography>
                            </PremiumTableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </PremiumTableContainer>

                {/* Pagination */}
                {filteredLogs.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <TablePagination
                      component="div"
                      count={filteredLogs.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50, 100]}
                      sx={{
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                          {
                            color: accentColor,
                            fontWeight: 600,
                          },
                      }}
                    />
                  </Box>
                )}
              </GlassCard>
            </Fade>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AuditLogs;