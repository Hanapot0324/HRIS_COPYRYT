import API_BASE_URL from '../../apiConfig';
import React, { useState } from 'react';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';

import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Avatar,
  Tooltip,
  Chip,
  Fade,
  Alert,
  useTheme,
  styled,
  Divider,
  CardHeader,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close,
  Schedule,
  UploadFile,
  FilterList,
  Person,
  AccessTime,
} from '@mui/icons-material';

import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';

// Color scheme
const primaryColor = '#FEF9E1'; // Cream
const secondaryColor = '#FFF8E7'; // Light cream
const accentColor = '#6D2323'; // Burgundy
const accentDark = '#8B3333'; // Darker burgundy
const blackColor = '#1a1a1a';
const whiteColor = '#FFFFFF';
const grayColor = '#6c757d';

// Styled components
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
  overflow: 'auto', // Enable both horizontal and vertical scrolling
  boxShadow: '0 4px 24px rgba(109, 35, 35, 0.06)',
  border: '1px solid rgba(109, 35, 35, 0.08)',
  maxHeight: '600px', // Set max height for vertical scrolling
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(254, 249, 225, 0.3)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(109, 35, 35, 0.4)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(109, 35, 35, 0.6)',
    },
  },
}));

const PremiumTableCell = styled(TableCell)(({ theme, isHeader = false }) => ({
  fontWeight: isHeader ? 600 : 500,
  padding: '18px 20px',
  borderBottom: isHeader ? '2px solid rgba(254, 249, 225, 0.5)' : '1px solid rgba(109, 35, 35, 0.06)',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
  minWidth: '120px', // Ensure minimum width for cells
  whiteSpace: 'nowrap', // Prevent text wrapping
}));

const OfficialTimeForm = () => {
  const [employeeID, setemployeeID] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);

  const [file, setFile] = useState(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewRecords, setPreviewRecords] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  const defaultRecords = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ].map((day) => ({
    employeeID,
    day,
    officialTimeIN: '00:00:00 AM',
    officialBreaktimeIN: '00:00:00 AM',
    officialBreaktimeOUT: '00:00:00 PM',
    officialTimeOUT: '00:00:00 PM',
    officialHonorariumTimeIN: '00:00:00 AM',
    officialHonorariumTimeOUT: '00:00:00 PM',
    officialServiceCreditTimeIN: '00:00:00 AM',
    officialServiceCreditTimeOUT: '00:00:00 AM',
    officialOverTimeIN: '00:00:00 AM',
    officialOverTimeOUT: '00:00:00 PM',
    breaktime: '',
  }));

  const handleSearch = () => {
    if (!employeeID) {
      setSuccessAction('Please enter an Employee ID.');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
      return;
    }

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/officialtimetable/${employeeID}`, getAuthHeaders())
      .then((res) => {
        setLoading(false);
        if (res.data.length > 0) {
          setRecords(res.data);
          setFound(true);
        } else {
          setRecords(defaultRecords);
          setFound(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
        setSuccessAction('Error fetching records.');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      });
  };

  const handleChange = (index, field, value) => {
    const updatedRecords = [...records];
    updatedRecords[index][field] = value;
    setRecords(updatedRecords);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeID) {
      setSuccessAction('Please enter a valid Employee ID.');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
      return;
    }

    setLoading(true);
    axios
      .post(
        `${API_BASE_URL}/officialtimetable`,
        {
          employeeID,
          records,
        },
        getAuthHeaders()
      )
      .then((res) => {
        setLoading(false);
        setSuccessAction(found ? 'Updated Successfully' : 'Saved Successfully');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      })
      .catch((err) => {
        console.error('Error saving data:', err);
        setLoading(false);
        setSuccessAction('Error saving records.');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      });
  };

  const PreviewModal = () => (
    <Dialog
      open={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '3px solid #6D2323',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#6D2323',
          color: '#FEF9E1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Uploaded Records Preview
        </Typography>
        <IconButton
          onClick={() => setShowPreviewModal(false)}
          sx={{
            color: '#FEF9E1',
            '&:hover': {
              backgroundColor: 'rgba(254, 249, 225, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
        <PremiumTableContainer>
          <Table 
            stickyHeader 
          >
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(254, 249, 225, 0.7)' }}>
                {[
                  'Employee Number',
                  'Day',
                  'Time In',
                  'Break In',
                  'Break Out',
                  'Time Out',
                  'Honorarium Time In',
                  'Honorarium Time Out',
                  'Service Credit Time In',
                  'Service Credit Time Out',
                  'Over-Time In',
                  'Over-Time Out',
                ].map((header, i) => (
                  <PremiumTableCell
                    key={i}
                    isHeader
                    sx={{ color: accentColor }}
                  >
                    {header}
                  </PremiumTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRecords.map((record, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(even)': { bgcolor: 'rgba(254, 249, 225, 0.3)' },
                    '&:hover': { bgcolor: 'rgba(109, 35, 35, 0.05)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <PremiumTableCell>{record.employeeID}</PremiumTableCell>
                  <PremiumTableCell>{record.day}</PremiumTableCell>
                  <PremiumTableCell>{record.officialTimeIN}</PremiumTableCell>
                  <PremiumTableCell>{record.officialBreaktimeIN}</PremiumTableCell>
                  <PremiumTableCell>{record.officialBreaktimeOUT}</PremiumTableCell>
                  <PremiumTableCell>{record.officialTimeOUT}</PremiumTableCell>
                  <PremiumTableCell>{record.officialHonorariumTimeIN}</PremiumTableCell>
                  <PremiumTableCell>{record.officialHonorariumTimeOUT}</PremiumTableCell>
                  <PremiumTableCell>{record.officialServiceCreditTimeIN}</PremiumTableCell>
                  <PremiumTableCell>{record.officialServiceCreditTimeOUT}</PremiumTableCell>
                  <PremiumTableCell>{record.officialOverTimeIN}</PremiumTableCell>
                  <PremiumTableCell>{record.officialOverTimeOUT}</PremiumTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PremiumTableContainer>
      <DialogActions
        sx={{
          backgroundColor: '#FEF9E1',
          padding: '16px 24px',
          justifyContent: 'center',
        }}
      >
        <ProfessionalButton
          onClick={() => setShowPreviewModal(false)}
          variant="contained"
          sx={{
            backgroundColor: accentColor,
            color: primaryColor,
            '&:hover': {
              backgroundColor: accentDark,
            }
          }}
        >
          Close
        </ProfessionalButton>
      </DialogActions>
    </Dialog>
  );

  const handleUpload = async () => {
    if (!file) {
      setSuccessAction('Please select a file!');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload-excel-faculty-official-time`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      setLoading(false);

      // Display uploaded records in modal if they exist
      if (response.data.records && response.data.records.length > 0) {
        setPreviewRecords(response.data.records);
        setShowPreviewModal(true);
      }

      setSuccessAction(
        `${response.data.message} (Inserted: ${response.data.inserted}, Updated: ${response.data.updated})`
      );
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);

      // Clear file selection
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
      setSuccessAction('Upload failed!');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    }
  };

  return (
    <>
      {/* LoadingOverlay - Now outside everything to cover full page */}
      <LoadingOverlay open={loading} message="Processing..." />
      
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
                        <Schedule sx={{color: accentColor, fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                          Official Time Schedule
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                          Manage and update official time schedules for employees
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
                          onClick={handleSearch}
                          disabled={!employeeID}
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
                          <SearchIcon />
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
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(primaryColor, 0.8), color: accentColor }}>
                      <FilterList />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ color: accentDark }}>
                        Search for employee or upload Excel file with time schedules
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
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: accentColor, display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Person sx={{ mr: 2, fontSize: 24 }} />
                      Employee Search
                    </Typography>
                    <Box display="flex" gap={2} alignItems="flex-end">
                      <Box sx={{ flexGrow: 1 }}>
                        <ModernTextField
                          fullWidth
                          label="Employee Number"
                          value={employeeID}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              setemployeeID(value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person sx={{ color: accentColor }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <ProfessionalButton
                        variant="contained"
                        onClick={handleSearch}
                        startIcon={<SearchIcon />}
                        disabled={!employeeID}
                        sx={{
                          bgcolor: accentColor,
                          color: primaryColor,
                        }}
                      >
                        Search
                      </ProfessionalButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: accentColor, display: 'flex', alignItems: 'center', mb: 3 }}>
                      <UploadFile sx={{ mr: 2, fontSize: 24 }} />
                      File Upload
                    </Typography>
                    <Box display="flex" gap={2} alignItems="flex-end">
                      <Box sx={{ flexGrow: 1 }}>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          id="upload-button"
                          style={{ display: 'none' }}
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label htmlFor="upload-button">
                          <ProfessionalButton
                            variant="outlined"
                            component="span"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            sx={{
                              borderColor: accentColor,
                              color: accentColor,
                              '&:hover': {
                                backgroundColor: alpha(accentColor, 0.1),
                              }
                            }}
                          >
                            Choose File
                          </ProfessionalButton>
                        </label>
                        {file && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(accentColor, 0.1), borderRadius: 2 }}>
                            <Typography variant="body2" color={accentColor}>
                              Selected: {file.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <ProfessionalButton
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!file}
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          bgcolor: accentColor,
                          color: primaryColor,
                        }}
                      >
                        Upload
                      </ProfessionalButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>
          </Fade>

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
                      Time Schedule for Employee
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: accentColor }}>
                      {employeeID}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                      <Chip 
                        icon={<AccessTime />}
                        label={found ? "Existing Schedule" : "New Schedule"}
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
                    <Schedule />
                  </Avatar>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
                  <PremiumTableContainer>
                    <Table 
                      stickyHeader 
                      sx={{ 
                        minWidth: '1400px', // Set minimum width to ensure horizontal scrolling
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(254, 249, 225, 0.7)' }}>
                          {[
                            'Employee Number',
                            'Day',
                            'Time In',
                            'Break In',
                            'Break Out',
                            'Time Out',
                            'Honorarium Time In',
                            'Honorarium Time Out',
                            'Service Credit Time In',
                            'Service Credit Time Out',
                            'Over-Time In',
                            'Over-Time Out',
                          ].map((header, i) => (
                            <PremiumTableCell
                              key={i}
                              isHeader
                              sx={{ color: accentColor }}
                            >
                              {header}
                            </PremiumTableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.map((record, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:nth-of-type(even)': { bgcolor: 'rgba(254, 249, 225, 0.3)' },
                              '&:hover': { bgcolor: 'rgba(109, 35, 35, 0.05)' },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.employeeID}
                                InputProps={{ readOnly: true }}
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.day}
                                InputProps={{ readOnly: true }}
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialTimeIN}
                                onChange={(e) =>
                                  handleChange(index, 'officialTimeIN', e.target.value)
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialBreaktimeIN}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialBreaktimeIN',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialBreaktimeOUT}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialBreaktimeOUT',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialTimeOUT}
                                onChange={(e) =>
                                  handleChange(index, 'officialTimeOUT', e.target.value)
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialHonorariumTimeIN}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialHonorariumTimeIN',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialHonorariumTimeOUT}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialHonorariumTimeOUT',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialServiceCreditTimeIN}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialServiceCreditTimeIN',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialServiceCreditTimeOUT}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialServiceCreditTimeOUT',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialOverTimeIN}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialOverTimeIN',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                            <PremiumTableCell>
                              <ModernTextField
                                variant="outlined"
                                size="small"
                                value={record.officialOverTimeOUT}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    'officialOverTimeOUT',
                                    e.target.value
                                  )
                                }
                              />
                            </PremiumTableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </PremiumTableContainer>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <ProfessionalButton
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{
                        py: 2,
                        px: 6,
                        bgcolor: accentColor,
                        color: primaryColor,
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: accentDark,
                        }
                      }}
                    >
                      {found ? 'Update' : 'Save'}
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          )}

          {/* Modal */}
          <PreviewModal />
          
          {/* Success Overlay */}
          <SuccessfulOverlay open={successOpen} action={successAction} />
        </Box>
      </Box>
    </>
  );
};

export default OfficialTimeForm;