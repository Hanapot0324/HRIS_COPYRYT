import API_BASE_URL from "../../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Alert,
  LinearProgress,
  alpha,
  CardHeader,
  Stack,
  Chip,
  useTheme,
  styled,
  Breadcrumbs,
  Link,
  Skeleton,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  Today,
  ArrowBackIos,
  ArrowForwardIos,
  Clear,
  SaveAs,
  Refresh,
  Edit,
  Home,
  Assessment,
  DateRange,
  FilterList,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";

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

const AttendanceSearch = () => {
  const [personID, setPersonID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const theme = useTheme();

  // Swapped color scheme
  const primaryColor = '#FEF9E1'; // Now cream is primary
  const secondaryColor = '#FFF8E7'; // Light cream
  const accentColor = '#6d2323'; // Burgundy is now accent
  const accentDark = '#8B3333'; // Darker burgundy
  const blackColor = '#1a1a1a';
  const whiteColor = '#FFFFFF';
  const grayColor = '#6c757d';

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

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

  const fetchRecords = async (showLoading = true) => {
    if (!personID || !startDate || !endDate) return;
    
    if (showLoading) setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        {
          personID,
          startDate,
          endDate,
        },
        getAuthHeaders()
      );
      setRecords(response.data);
    } catch (err) {
      console.error("Axios error:", err.response ? err.response.data : err);
      setError("Failed to fetch attendance records. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const saveAll = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await axios.put(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        { records },
        getAuthHeaders()
      );
      setSuccess(response.data.message || "Records saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedRecords = [...records];
    updatedRecords[index][field] = value;
    setRecords(updatedRecords);
  };

  const currentYear = new Date().getFullYear();
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  const handleMonthClick = (monthIndex) => {
    const year = new Date().getFullYear();
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));
    const formattedStart = start.toISOString().substring(0, 10);
    const formattedEnd = end.toISOString().substring(0, 10);
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
  };

  const handleClearFilters = () => {
    setPersonID("");
    setStartDate("");
    setEndDate("");
    setRecords([]);
    setError("");
    setSuccess("");
  };

  // Auto-fetch when dates change (for quick select buttons)
  useEffect(() => {
    if (personID && startDate && endDate) {
      fetchRecords(false); // Silent fetch without loading indicator
    }
  }, [startDate, endDate]);

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
                        width: 64, 
                        height: 64,
                        boxShadow: '0 8px 24px rgba(109,35,35,0.15)'
                      }}
                    >
                      <Edit sx={{ fontSize: 32, color: accentColor }} />
                    </Avatar>
                    <Box>
                      {/* Changed from h3 to h4 for smaller title */}
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Attendance Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Review and manage attendance records
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Editable Records" 
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
                        onClick={() => fetchRecords(true)}
                        disabled={!personID || !startDate || !endDate}
                        sx={{ 
                          bgcolor: 'rgba(109,35,35,0.1)', 
                          '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                          color: accentColor,
                          width: 48,
                          height: 48,
                          '&:disabled': { 
                            bgcolor: 'rgba(109,35,35,0.05)',
                            color: 'rgba(109,35,35,0.3)'
                          }
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

        {/* Controls */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form">
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="Employee Number"
                      value={personID}
                      onChange={(e) => setPersonID(e.target.value)}
                      required
                      variant="outlined"
                      placeholder="Enter employee ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: accentColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: accentColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: accentColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: 'rgba(109,35,35,0.1)' }} />

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
                                   <CalendarToday sx={{ mr: 2, fontSize: 24 }} />
                                   <b>Month:</b> <i>(select month to search employee records)</i>
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
                                   {months.map((month, index) => (
                                     <ProfessionalButton
                                       key={month}
                                       variant="outlined"
                                       size="small"
                                       onClick={() => handleMonthClick(index)}
                                       sx={{
                                         borderColor: accentColor,
                                         color: accentColor,
                                         minWidth: "auto",
                                         fontSize: "0.875rem",
                                         fontWeight: 500,
                                         py: 1,
                                         "&:hover": {
                                           backgroundColor: alpha(accentColor, 0.1),
                                         },
                                       }}
                                     >
                                       {month}
                                     </ProfessionalButton>
                                   ))}
                                 </Box>
                               </Box>
               
                               {/* Quick Select */}
                               <Box>
                                 <Typography
                                   variant="h6"
                                   gutterBottom
                                   sx={{
                                     color: accentColor,
                                     display: "flex",
                                     alignItems: "center",
                                   }}
                                 >
                                   <FilterList sx={{ mr: 2, fontSize: 24 }} />
                                   <b>Filters:</b>
                                 </Typography>
                                 <Box
                                   sx={{
                                     display: "flex",
                                     flexWrap: "wrap",
                                     gap: 1,
                                   }}
                                 >
                                   <ProfessionalButton
                                     variant="outlined"
                                     startIcon={<Today />}
                                     onClick={() => {
                                       setStartDate(formattedToday);
                                       setEndDate(formattedToday);
                                     }}
                                     sx={{
                                       fontWeight: "normal",
                                       fontSize: "small",
                                       borderColor: accentColor,
                                       color: accentColor,
                                       "&:hover": {
                                         backgroundColor: alpha(accentColor, 0.1),
                                       },
                                     }}
                                   >
                                     TODAY
                                   </ProfessionalButton>
                                   <ProfessionalButton
                                     variant="outlined"
                                     startIcon={<ArrowBackIos />}
                                     onClick={() => {
                                       const yesterday = new Date(today);
                                       yesterday.setDate(yesterday.getDate() - 1);
                                       const yesterdayFormatted = yesterday
                                         .toISOString()
                                         .substring(0, 10);
                                       setStartDate(yesterdayFormatted);
                                       setEndDate(yesterdayFormatted);
                                     }}
                                     sx={{
                                       fontWeight: "normal",
                                       fontSize: "small",
                                       borderColor: accentColor,
                                       color: accentColor,
                                       "&:hover": { backgroundColor: alpha(accentColor, 0.1) },
                                     }}
                                   >
                                     YESTERDAY
                                   </ProfessionalButton>
                                   <ProfessionalButton
                                     variant="outlined"
                                     onClick={() => {
                                       const lastWeek = new Date(today);
                                       lastWeek.setDate(lastWeek.getDate() - 7);
                                       const lastWeekFormatted = lastWeek
                                         .toISOString()
                                         .substring(0, 10);
                                       setStartDate(lastWeekFormatted);
                                       setEndDate(formattedToday);
                                     }}
                                     sx={{
                                       fontWeight: "normal",
                                       fontSize: "small",
                                       borderColor: accentColor,
                                       color: accentColor,
                                       "&:hover": { backgroundColor: alpha(accentColor, 0.1) },
                                     }}
                                   >
                                     LAST 7 DAYS
                                     {
                                       <ArrowForwardIos
                                         sx={{ marginLeft: "10px", fontSize: "large" }}
                                       />
                                     }
                                   </ProfessionalButton>
                                   <ProfessionalButton
                                     variant="outlined"
                                     onClick={() => {
                                       const fifteenDaysAgo = new Date(today);
                                       fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
                                       const fifteenDaysAgoFormatted = fifteenDaysAgo
                                         .toISOString()
                                         .substring(0, 10);
                                       setStartDate(fifteenDaysAgoFormatted);
                                       setEndDate(formattedToday);
                                     }}
                                     sx={{
                                       fontWeight: "normal",
                                       fontSize: "small",
                                       borderColor: accentColor,
                                       color: accentColor,
                                       "&:hover": { backgroundColor: alpha(accentColor, 0.1) },
                                     }}
                                   >
                                     LAST 15 DAYS
                                   </ProfessionalButton>
                                   <ProfessionalButton
                                     variant="outlined"
                                     startIcon={<Clear />}
                                     onClick={handleClearFilters}
                                     sx={{
                                       fontWeight: "normal",
                                       fontSize: "small",
                                       borderColor: accentColor,
                                       color: accentColor,
                                       "&:hover": { backgroundColor: alpha(accentColor, 0.1) },
                                     }}
                                   >
                                     CLEAR ALL
                                   </ProfessionalButton>
                                 </Box>
                               </Box>
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: primaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Fetching attendance records...
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
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {success && (
          <Fade in timeout={300}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          </Fade>
        )}

        {/* Results */}
        {records.length > 0 && (
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
                    Editable Attendance Records
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: accentColor }}>
                    <b>{personID}</b>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Chip 
                      icon={<Edit />}
                      label={`${records.length} Records`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500
                      }} 
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8, color: accentDark }}>
                      {startDate} to {endDate}
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
                  <Edit />
                </Avatar>
              </Box>

              <PremiumTableContainer>
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead sx={{ bgcolor: alpha(primaryColor, 0.7) }}>
                    <TableRow>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 120 }}>Employee Number</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 100 }}>Date</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 100 }}>Day</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Time IN</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Breaktime IN</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Breaktime OUT</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Time OUT</PremiumTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(even)': { bgcolor: alpha(primaryColor, 0.3) },
                          '&:hover': { bgcolor: alpha(accentColor, 0.05) },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <PremiumTableCell>{record.personID}</PremiumTableCell>
                        <PremiumTableCell>{record.date}</PremiumTableCell>
                        <PremiumTableCell>{record.Day}</PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.timeIN || ""}
                            onChange={(e) => handleInputChange(index, "timeIN", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.breaktimeIN || ""}
                            onChange={(e) => handleInputChange(index, "breaktimeIN", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.breaktimeOUT || ""}
                            onChange={(e) => handleInputChange(index, "breaktimeOUT", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.timeOUT || ""}
                            onChange={(e) => handleInputChange(index, "timeOUT", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PremiumTableContainer>
            </GlassCard>
          </Fade>
        )}

        {/* Save Button */}
        {records.length > 0 && (
          <Fade in timeout={900}>
            <GlassCard>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(primaryColor, 0.8), color: accentColor }}>
                      <SaveAs />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ color: accentDark }}>
                        Apply all modifications to the attendance records
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
                  startIcon={<SaveAs />}
                  onClick={saveAll}
                  disabled={loading}
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
                  Save All Changes
                </ProfessionalButton>
              </CardContent>
            </GlassCard>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceSearch;