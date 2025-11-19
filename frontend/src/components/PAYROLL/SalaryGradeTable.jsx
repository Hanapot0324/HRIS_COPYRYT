import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Container,
  Typography,
  Chip,
  Grid,
  Paper,
  Box,
  InputAdornment,
  Fade,
  Backdrop,
  styled,
  alpha,
  Avatar,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upgrade,
  Search,
  Shortcut,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Professional styled components matching PayslipOverall
const GlassCard = styled(Paper)(({ theme }) => ({
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

const ModernSelect = styled(FormControl)(({ theme }) => ({
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

const PremiumTableContainer = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(109, 35, 35, 0.06)',
  border: '1px solid rgba(109, 35, 35, 0.08)',
  backgroundColor: '#fff',
}));

const SalaryGradeTable = () => {
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [newSalaryGrade, setNewSalaryGrade] = useState({
    effectivityDate: '2024', // Default to 2024
    sg_number: '',
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
    step6: '',
    step7: '',
    step8: '',
  });
  const [editSalaryGradeId, setEditSalaryGradeId] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    effectivityDate: '',
    step: '',
  });
  const navigate = useNavigate();
  
  // Color scheme matching PayslipOverall
  const primaryColor = '#FEF9E1'; // Cream is primary
  const secondaryColor = '#FFF8E7'; // Light cream
  const accentColor = '#6d2323'; // Burgundy is accent
  const accentDark = '#8B3333'; // Darker burgundy
  const blackColor = '#1a1a1a';
  const whiteColor = '#FFFFFF';
  const grayColor = '#6c757d';

  // Generate year options for dropdown (2020 to 10 years in the future from current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 2020; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Generate salary grade options
  const generateSGOptions = () => {
    const options = [];
    for (let i = 1; i <= 33; i++) {
      options.push(i.toString());
    }
    options.push("Job Order(Graduated)");
    options.push("Job Order(Undergraduate)");
    return options;
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // or however you store token
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchSalaryGrades();
  }, []);

  useEffect(() => {
    const { effectivityDate, step } = searchFilters;

    if (!effectivityDate && !step) {
      setFilteredGrades(salaryGrades);
      return;
    }

    const filtered = salaryGrades.filter((record) => {
      const matchDate = record.effectivityDate
        .toLowerCase()
        .includes(effectivityDate.toLowerCase());
      const matchStep = [...Array(8)].some((_, i) =>
        record[`step${i + 1}`]
          ?.toString()
          .toLowerCase()
          .includes(step.toLowerCase())
      );
      return matchDate && matchStep;
    });

    setFilteredGrades(filtered);
  }, [searchFilters, salaryGrades]);

  const fetchSalaryGrades = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/SalaryGradeTable/salary-grade`,
        getAuthHeaders()
      );
      setSalaryGrades(response.data);
      setFilteredGrades(response.data);
    } catch (error) {
      console.error('Error fetching salary grades:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        // Optionally redirect to login
        // navigate('/login');
      }
    }
  };

  const addSalaryGrade = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/SalaryGradeTable/salary-grade`,
        newSalaryGrade,
        getAuthHeaders()
      );
      setNewSalaryGrade({
        effectivityDate: '2024', // Reset to 2024
        sg_number: '',
        step1: '',
        step2: '',
        step3: '',
        step4: '',
        step5: '',
        step6: '',
        step7: '',
        step8: '',
      });
      fetchSalaryGrades();
    } catch (error) {
      console.error('Error adding salary grade:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
      }
    }
  };

  const updateSalaryGrade = async (id) => {
    const updatedRecord = salaryGrades.find((rec) => rec.id === id);
    try {
      await axios.put(
        `${API_BASE_URL}/SalaryGradeTable/salary-grade/${id}`,
        updatedRecord,
        getAuthHeaders()
      );
      setEditSalaryGradeId(null);
      fetchSalaryGrades();
    } catch (error) {
      console.error('Error updating salary grade:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
      }
    }
  };

  const deleteSalaryGrade = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/SalaryGradeTable/salary-grade/${id}`,
        getAuthHeaders()
      );
      fetchSalaryGrades();
    } catch (error) {
      console.error('Error deleting salary grade:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
      }
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.toString().split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: 'rgba(109, 35, 35, 0.2)' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <Box sx={{ 
      py: 4,
      mt: -5,
      width: '1600px', // Fixed width
      mx: 'auto', // Center horizontally
      overflow: 'hidden', // Prevent horizontal scroll
    }}>
      {/* Container with fixed width */}
      <Box sx={{ px: 6 }}>
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
                      <Upgrade sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Tranche Salary Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        For Civilian Personnel of National Government
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Enterprise Grade" 
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
                        <Refresh sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Add Salary Grade Form */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4 }}>
            <Box
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Upgrade sx={{ fontSize: "1.8rem", mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Add New Salary Grade
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Fill in salary grade information
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                    Effectivity Date
                  </Typography>
                  <ModernSelect fullWidth variant="outlined">
                    <InputLabel id="effectivity-date-label">Year</InputLabel>
                    <Select
                      labelId="effectivity-date-label"
                      value={newSalaryGrade.effectivityDate}
                      onChange={(e) =>
                        setNewSalaryGrade({
                          ...newSalaryGrade,
                          effectivityDate: e.target.value,
                        })
                      }
                      label="Year"
                    >
                      {generateYearOptions().map((year) => (
                        <MenuItem key={year} value={year.toString()}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </ModernSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                    Salary Grade Number
                  </Typography>
                  <ModernSelect fullWidth variant="outlined">
                    <InputLabel id="sg-number-label">Salary Grade</InputLabel>
                    <Select
                      labelId="sg-number-label"
                      value={newSalaryGrade.sg_number}
                      onChange={(e) =>
                        setNewSalaryGrade({
                          ...newSalaryGrade,
                          sg_number: e.target.value,
                        })
                      }
                      label="Salary Grade"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            width: '200px', // Set dropdown menu width
                            maxHeight: '300px', // Set max height to prevent too long menu
                          }
                        }
                      }}
                    >
                      {generateSGOptions().map((sg) => (
                        <MenuItem key={sg} value={sg}>
                          {sg}
                        </MenuItem>
                      ))}
                    </Select>
                  </ModernSelect>
                </Grid>
                {[...Array(8)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                      Step {i + 1}
                    </Typography>
                    <ModernTextField
                      fullWidth
                      value={newSalaryGrade[`step${i + 1}`]}
                      onChange={(e) =>
                        setNewSalaryGrade({
                          ...newSalaryGrade,
                          [`step${i + 1}`]: e.target.value,
                        })
                      }
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <ProfessionalButton
                    onClick={addSalaryGrade}
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      backgroundColor: accentColor,
                      color: primaryColor,
                      py: 1.5,
                      fontSize: '1rem',
                      "&:hover": { 
                        backgroundColor: accentDark,
                      },
                    }}
                  >
                    Add Salary Grade
                  </ProfessionalButton>
                </Grid>
              </Grid>
            </Box>
          </GlassCard>
        </Fade>

        {/* Search Filters & Shortcut */}
        <Fade in timeout={900}>
          <GlassCard sx={{ mb: 4 }}>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                <ModernTextField
                  label="Search by Date"
                  size="small"
                  value={searchFilters.effectivityDate}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      effectivityDate: e.target.value,
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: accentColor }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: '200px' }}
                />
                <ModernTextField
                  label="Search by Step"
                  size="small"
                  value={searchFilters.step}
                  onChange={(e) =>
                    setSearchFilters({ ...searchFilters, step: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: accentColor }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: '200px' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ProfessionalButton
                  variant="contained"
                  startIcon={<Shortcut />}
                  onClick={() => navigate('/item-table')}
                  sx={{
                    backgroundColor: accentColor,
                    color: primaryColor,
                    "&:hover": { backgroundColor: accentDark },
                  }}
                >
                  Insert to Item Table
                </ProfessionalButton>
                <Tooltip title="Clear Filters">
                  <IconButton 
                    onClick={() => setSearchFilters({ effectivityDate: '', step: '' })}
                    sx={{ 
                      bgcolor: 'rgba(109,35,35,0.1)', 
                      '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                      color: accentColor,
                    }}
                  >
                    <Refresh sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </GlassCard>
        </Fade>

        {/* Salary Grade Table */}
        <Fade in timeout={1100}>
          <PremiumTableContainer>
            <Table sx={{ backgroundColor: '#fff' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: accentColor }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Effectivity Date
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                    SG Number
                  </TableCell>
                  {[...Array(8)].map((_, i) => (
                    <TableCell key={i} sx={{ color: '#fff', fontWeight: 'bold' }}>
                      Step {i + 1}
                    </TableCell>
                  ))}
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color={accentColor}>
                        No matching records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrades.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {editSalaryGradeId === record.id ? (
                          <ModernSelect fullWidth variant="outlined" size="small">
                            <Select
                              value={record.effectivityDate}
                              onChange={(e) => {
                                const updated = {
                                  ...record,
                                  effectivityDate: e.target.value,
                                };
                                setSalaryGrades((prev) =>
                                  prev.map((r) => (r.id === record.id ? updated : r))
                                );
                              }}
                            >
                              {generateYearOptions().map((year) => (
                                <MenuItem key={year} value={year.toString()}>
                                  {year}
                                </MenuItem>
                              ))}
                            </Select>
                          </ModernSelect>
                        ) : (
                          highlightText(
                            record.effectivityDate,
                            searchFilters.effectivityDate
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {editSalaryGradeId === record.id ? (
                          <ModernSelect fullWidth variant="outlined" size="small">
                            <Select
                              value={record.sg_number}
                              onChange={(e) => {
                                const updated = {
                                  ...record,
                                  sg_number: e.target.value,
                                };
                                setSalaryGrades((prev) =>
                                  prev.map((r) => (r.id === record.id ? updated : r))
                                );
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    width: '200px', // Set dropdown menu width
                                    maxHeight: '300px', // Set max height
                                  }
                                }
                              }}
                            >
                              {generateSGOptions().map((sg) => (
                                <MenuItem key={sg} value={sg}>
                                  {sg}
                                </MenuItem>
                              ))}
                            </Select>
                          </ModernSelect>
                        ) : (
                          highlightText(
                            record.sg_number,
                            searchFilters.effectivityDate
                          )
                        )}
                      </TableCell>
                      {[...Array(8)].map((_, i) => (
                        <TableCell key={i}>
                          {editSalaryGradeId === record.id ? (
                            <ModernTextField
                              size="small"
                              value={record[`step${i + 1}`]}
                              onChange={(e) => {
                                const updated = {
                                  ...record,
                                  [`step${i + 1}`]: e.target.value,
                                };
                                setSalaryGrades((prev) =>
                                  prev.map((r) => (r.id === record.id ? updated : r))
                                );
                              }}
                            />
                          ) : (
                            highlightText(
                              record[`step${i + 1}`],
                              searchFilters.step
                            )
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        {editSalaryGradeId === record.id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <ProfessionalButton
                              onClick={() => updateSalaryGrade(record.id)}
                              variant="contained"
                              startIcon={<SaveIcon />}
                              sx={{
                                backgroundColor: accentColor,
                                color: primaryColor,
                                py: 0.5,
                                fontSize: '0.8rem',
                              }}
                            >
                              Update
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => setEditSalaryGradeId(null)}
                              variant="contained"
                              startIcon={<CancelIcon />}
                              sx={{
                                backgroundColor: blackColor,
                                color: primaryColor,
                                py: 0.5,
                                fontSize: '0.8rem',
                              }}
                            >
                              Cancel
                            </ProfessionalButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <ProfessionalButton
                              onClick={() => setEditSalaryGradeId(record.id)}
                              variant="contained"
                              startIcon={<EditIcon />}
                              sx={{
                                backgroundColor: accentColor,
                                color: primaryColor,
                                py: 0.5,
                                fontSize: '0.8rem',
                                mb: 1,
                              }}
                            >
                              Edit
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => deleteSalaryGrade(record.id)}
                              variant="contained"
                              startIcon={<DeleteIcon />}
                              sx={{
                                backgroundColor: blackColor,
                                color: primaryColor,
                                py: 0.5,
                                fontSize: '0.8rem',
                              }}
                            >
                              Delete
                            </ProfessionalButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </PremiumTableContainer>
        </Fade>
      </Box>
    </Box>
  );
};

export default SalaryGradeTable;