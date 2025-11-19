import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';
import {
  CloudUpload,
  DeleteForever,
  Delete as DeleteIcon,
  Email,
  Lock,
  Payment,
  Pending,
  Publish as PublishIcon,
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Checkbox } from '@mui/material';

import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

// Custom styled TableCell for Excel-like appearance
const ExcelTableCell = ({ children, header, ...props }) => (
  <TableCell
    {...props}
    sx={{
      border: '1px solid #E0E0E0',
      padding: '8px',
      backgroundColor: header ? '#F5F5F5' : 'inherit',
      fontWeight: header ? 'bold' : 'normal',
      whiteSpace: 'nowrap',
      '&:hover': {
        backgroundColor: header ? '#F5F5F5' : '#F8F8F8',
      },
      ...props.sx,
    }}
  >
    {children}
  </TableCell>
);

const PayrollProcessed = () => {
  const [finalizedData, setFinalizedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openPasskey, setOpenPasskey] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFinalizedData, setFilteredFinalizedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [openReleaseConfirm, setOpenReleaseConfirm] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releasedIdSet, setReleasedIdSet] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Month options for filtering
  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Year options for filtering
  const yearOptions = [
    { value: '', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  // Normalize a date string to YYYY-MM-DD for reliable key comparison
  const normalizeDateString = (dateInput) => {
    try {
      if (!dateInput) return '';
      const d = new Date(dateInput);
      if (Number.isNaN(d.getTime())) return String(dateInput);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (_) {
      return String(dateInput);
    }
  };

  // Build a consistent composite key for a payroll record
  const getRecordKey = (record) => {
    const emp = record?.employeeNumber ?? '';
    const start = normalizeDateString(record?.startDate);
    const end = normalizeDateString(record?.endDate);
    return `${emp}-${start}-${end}`;
  };

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

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    applyFilters(selectedDepartment, searchTerm, newDate);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTableHeight = () => {
    const rowHeight = 53;
    const headerHeight = 56;
    const paginationHeight = 52;
    const minHeight = 300;
    const maxHeight = 600;

    const contentHeight =
      Math.min(rowsPerPage, filteredFinalizedData.length) * rowHeight +
      headerHeight +
      paginationHeight;
    return Math.min(Math.max(contentHeight, minHeight), maxHeight);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/department-table`,
          getAuthHeaders()
        );
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchFinalizedPayroll = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/PayrollRoute/finalized-payroll`,
          getAuthHeaders()
        );
        setFinalizedData(res.data);
        setFilteredFinalizedData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching finalized payroll:', err);
        setError('An error occurred while fetching the finalized payroll.');
        setLoading(false);
      }
    };
    fetchFinalizedPayroll();
  }, []);

  // Fetch released payroll IDs to disable delete on those records
  useEffect(() => {
    const fetchReleasedPayroll = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/PayrollReleasedRoute/released-payroll`,
          getAuthHeaders()
        );
        // Build a set of composite keys to uniquely identify released records
        const releasedKeys = new Set();
        if (Array.isArray(res.data)) {
          res.data.forEach((record) => {
            const key = getRecordKey(record);
            releasedKeys.add(key);
          });
        }
        setReleasedIdSet(releasedKeys);
      } catch (err) {
        console.error(
          'Error fetching released payroll for disable logic:',
          err
        );
      }
    };
    fetchReleasedPayroll();
  }, []);

  const handleDepartmentChange = (event) => {
    const selectedDept = event.target.value;
    setSelectedDepartment(selectedDept);
    applyFilters(
      selectedDept,
      searchTerm,
      selectedDate,
      selectedMonth,
      selectedYear
    );
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    applyFilters(
      selectedDepartment,
      term,
      selectedDate,
      selectedMonth,
      selectedYear
    );
  };

  const handleMonthChange = (event) => {
    const selectedMonthValue = event.target.value;
    setSelectedMonth(selectedMonthValue);
    applyFilters(
      selectedDepartment,
      searchTerm,
      selectedDate,
      selectedMonthValue,
      selectedYear
    );
  };

  const handleYearChange = (event) => {
    const selectedYearValue = event.target.value;
    setSelectedYear(selectedYearValue);
    applyFilters(
      selectedDepartment,
      searchTerm,
      selectedDate,
      selectedMonth,
      selectedYearValue
    );
  };

  const applyFilters = (department, search, filterDate, month, year) => {
    let filtered = [...finalizedData];

    if (department) {
      filtered = filtered.filter((record) => record.department === department);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          (record.name || '').toLowerCase().includes(lowerSearch) ||
          (record.employeeNumber || '')
            .toString()
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    // Filter by date - check if the selected date falls within the payroll period
    if (filterDate) {
      filtered = filtered.filter((record) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        const selectedDate = new Date(filterDate);

        // Set time to start/end of day to ensure proper comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        selectedDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

        // Check if the selected date falls within the payroll period
        return selectedDate >= startDate && selectedDate <= endDate;
      });
    }

    // Apply month filter based on startDate
    if (month && month !== '') {
      filtered = filtered.filter((record) => {
        if (record.startDate) {
          const recordDate = new Date(record.startDate);
          const recordMonth = String(recordDate.getMonth() + 1).padStart(
            2,
            '0'
          );
          return recordMonth === month;
        }
        return false;
      });
    }

    // Apply year filter based on startDate
    if (year && year !== '') {
      filtered = filtered.filter((record) => {
        if (record.startDate) {
          const recordDate = new Date(record.startDate);
          const recordYear = recordDate.getFullYear().toString();
          return recordYear === year;
        }
        return false;
      });
    }

    setFilteredFinalizedData(filtered);
    setPage(0);
  };

  const handleDelete = async (rowId) => {
    setOverlayLoading(true);
    try {
      // First update UI immediately
      setFinalizedData((prev) => prev.filter((item) => item.id !== rowId));
      setFilteredFinalizedData((prev) =>
        prev.filter((item) => item.id !== rowId)
      );

      // Then make API call
      await axios.delete(
        `${API_BASE_URL}/PayrollRoute/finalized-payroll/${rowId}`,
        getAuthHeaders()
      );

      // Show loading for 2-3 seconds, then success overlay
      setTimeout(() => {
        setOverlayLoading(false);
        setSuccessAction('delete');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2500);
      }, 2500);
    } catch (error) {
      console.error('Error deleting payroll data:', error);
      setOverlayLoading(false);
      // If API call fails, revert the UI changes
      const res = await axios.get(
        `${API_BASE_URL}/PayrollRoute/finalized-payroll`,
        getAuthHeaders()
      );
      setFinalizedData(res.data);
      setFilteredFinalizedData((prev) => {
        // Reapply current filters
        let filtered = res.data;
        if (selectedDepartment) {
          filtered = filtered.filter(
            (record) => record.department === selectedDepartment
          );
        }
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (record) =>
              (record.name || '').toLowerCase().includes(lowerSearch) ||
              (record.employeeNumber || '')
                .toString()
                .toLowerCase()
                .includes(lowerSearch)
          );
        }
        return filtered;
      });
      alert('Failed to delete record. Please try again.');
    }
  };

  const initiateDelete = (rowOrIds) => {
    if (Array.isArray(rowOrIds)) {
      // Bulk delete mode - check if any selected record is already released
      const hasReleased = rowOrIds.some((id) => {
        const record = filteredFinalizedData.find((item) => item.id === id);
        if (!record) return false;
        const key = getRecordKey(record);
        return releasedIdSet.has(key);
      });

      if (hasReleased) {
        alert('Cannot delete records that are already released.');
        return;
      }
      // Bulk delete mode
      setSelectedRow({ isBulk: true, ids: rowOrIds });
    } else {
      // Single row delete - check if the record is already released
      const key = getRecordKey(rowOrIds);
      if (releasedIdSet.has(key)) {
        alert('This record is already released and cannot be deleted.');
        return;
      }
      setSelectedRow(rowOrIds);
    }
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    setOpenConfirm(false);
    setOpenPasskey(true);
  };

  const handlePasskeySubmit = async () => {
    const HARDCODED_PASSKEY = '20134507';

    if (passkeyInput !== HARDCODED_PASSKEY) {
      alert('Incorrect Passkey.');
      setOpenPasskey(false);
      return;
    }

    setOverlayLoading(true);
    try {
      if (selectedRow.isBulk) {
        // Guard again in case state changed - filter out released records
        const deletableIds = selectedRow.ids.filter((id) => {
          const record = filteredFinalizedData.find((item) => item.id === id);
          if (!record) return false;
          const key = getRecordKey(record);
          return !releasedIdSet.has(key);
        });

        if (deletableIds.length === 0) {
          setOverlayLoading(false);
          alert(
            'All selected records are already released and cannot be deleted.'
          );
          return;
        }
        // Bulk delete
        setFinalizedData((prev) =>
          prev.filter((item) => !deletableIds.includes(item.id))
        );
        setFilteredFinalizedData((prev) =>
          prev.filter((item) => !deletableIds.includes(item.id))
        );

        await Promise.all(
          deletableIds.map((id) =>
            axios.delete(
              `${API_BASE_URL}/PayrollRoute/finalized-payroll/${id}`,
              getAuthHeaders()
            )
          )
        );

        // Show loading for 2-3 seconds, then success overlay
        setTimeout(() => {
          setOverlayLoading(false);
          setSuccessAction('delete');
          setSuccessOpen(true);
          setTimeout(() => setSuccessOpen(false), 2500);
        }, 2500);
        setSelectedRows([]);
      } else {
        // Single delete - check again if the record is released
        const key = getRecordKey(selectedRow);
        if (releasedIdSet.has(key)) {
          setOverlayLoading(false);
          alert('This record is already released and cannot be deleted.');
          return;
        }

        // Single delete (existing logic)
        setFinalizedData((prev) =>
          prev.filter((item) => item.id !== selectedRow.id)
        );
        setFilteredFinalizedData((prev) =>
          prev.filter((item) => item.id !== selectedRow.id)
        );

        await axios.delete(
          `${API_BASE_URL}/PayrollRoute/finalized-payroll/${selectedRow.id}`,
          {
            ...getAuthHeaders(),
            data: {
              employeeNumber: selectedRow.employeeNumber,
              name: selectedRow.name,
            },
          }
        );

        // Show loading for 2-3 seconds, then success overlay
        setTimeout(() => {
          setOverlayLoading(false);
          setSuccessAction('delete');
          setSuccessOpen(true);
          setTimeout(() => setSuccessOpen(false), 2500);
        }, 2500);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setOverlayLoading(false);
      // Revert UI changes on error
      const res = await axios.get(
        `${API_BASE_URL}/PayrollRoute/finalized-payroll`,
        getAuthHeaders()
      );
      setFinalizedData(res.data);
      applyFilters(selectedDepartment, searchTerm, selectedDate);
      alert('Failed to delete record(s). Please try again.');
    } finally {
      setOpenPasskey(false);
      setPasskeyInput('');
      setSelectedRow(null);
    }
  };

  const handleReleasePayroll = async () => {
    if (selectedRows.length === 0) {
      alert('Please select payroll records to release.');
      return;
    }

    // Close the confirmation dialog first
    setOpenReleaseConfirm(false);

    // Start loading overlay
    setOverlayLoading(true);

    try {
      // Filter out any already released selections to prevent duplicates
      const unreleasedSelectedIds = selectedRows.filter((id) => {
        const record =
          finalizedData.find((item) => item.id === id) ||
          filteredFinalizedData.find((item) => item.id === id);
        if (!record) return false;
        const key = getRecordKey(record);
        return !releasedIdSet.has(key);
      });

      if (unreleasedSelectedIds.length === 0) {
        alert('All selected records are already released.');
        setOverlayLoading(false);
        return;
      }

      // Compute the composite keys for selected rows BEFORE mutating state
      const keysToAdd = unreleasedSelectedIds
        .map((id) => {
          const record =
            finalizedData.find((item) => item.id === id) ||
            filteredFinalizedData.find((item) => item.id === id);
          if (!record) return null;
          return getRecordKey(record);
        })
        .filter(Boolean);

      const response = await axios.post(
        `${API_BASE_URL}/PayrollReleasedRoute/release-payroll`,
        {
          payrollIds: unreleasedSelectedIds,
          releasedBy: localStorage.getItem('username') || 'System',
        },
        getAuthHeaders()
      );

      if (response.data) {
        // Remove released records from the current view
        setFinalizedData((prev) =>
          prev.filter((item) => !unreleasedSelectedIds.includes(item.id))
        );
        setFilteredFinalizedData((prev) =>
          prev.filter((item) => !unreleasedSelectedIds.includes(item.id))
        );

        // Mark these composite keys as released to immediately disable any related actions
        setReleasedIdSet(
          (prev) =>
            new Set([
              ...(prev instanceof Set ? Array.from(prev) : []),
              ...keysToAdd,
            ])
        );

        // Remove only the ones we released from selection; keep others if any
        setSelectedRows((prev) =>
          prev.filter((id) => !unreleasedSelectedIds.includes(id))
        );

        // Show loading for 2-3 seconds, then success overlay, then navigate
        setTimeout(() => {
          setOverlayLoading(false);
          setSuccessAction('release');
          setSuccessOpen(true);

          // Navigate to payroll-released after success overlay is shown
          setTimeout(() => {
            setSuccessOpen(false);
            window.location.href = '/payroll-released';
          }, 2500);
        }, 2500);
      }
    } catch (error) {
      console.error('Error releasing payroll:', error);
      setOverlayLoading(false);
      alert('Failed to release payroll records. Please try again.');
    }
  };

  const initiateRelease = () => {
    if (selectedRows.length === 0) {
      alert('Please select payroll records to release.');
      return;
    }
    setOpenReleaseConfirm(true);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 2 }}>
      <Paper
        elevation={6}
        sx={{
          backgroundColor: '#6D2323',
          color: '#fff',
          p: 3,
          borderRadius: 3,
          borderEndEndRadius: '0',
          borderEndStartRadius: '0',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Payment fontSize="large" />
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              fontFamily="'Poppins', sans-serif"
            >
              Payroll | Processed
            </Typography>
            <Typography
              variant="body2"
              color="rgba(255,255,255,0.7)"
              fontFamily="'Poppins', sans-serif"
            >
              Viewing all processed payroll records
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Box
        sx={{
          backgroundColor: 'white',
          border: '2px solid #6D2323',
          p: 1,
          mt: 0,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            type="date"
            label="Search by Date"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              minWidth: 200,
              bgcolor: '#fff',
              border: '1px solid #6d2323',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <FormControl
            variant="outlined"
            sx={{
              minWidth: 200,
              bgcolor: '#fff',
              border: '1px solid #6d2323',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          >
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              label="Department"
            >
              <MenuItem value="">
                <em>All Departments</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.code}>
                  {dept.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            sx={{
              minWidth: 120,
              bgcolor: '#fff',
              border: '1px solid #6d2323',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          >
            <InputLabel id="month-label">Month</InputLabel>
            <Select
              labelId="month-label"
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16 }} />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            sx={{
              minWidth: 100,
              bgcolor: '#fff',
              border: '1px solid #6d2323',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          >
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              labelId="year-label"
              value={selectedYear}
              onChange={handleYearChange}
              label="Year"
            >
              {yearOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16 }} />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            placeholder="Search Name"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              minWidth: 200,
              bgcolor: '#fff',
              border: '1px solid #6d2323',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                border: '3px solid #6d2323',
                flex: 1,
                minWidth: '800px',
                maxWidth: '1600px',
                pb: 0,
                height: getTableHeight(),
                display: 'flex',
                flexDirection: 'column',
                '& .MuiTableContainer-root': {
                  flex: 1,
                  '&::-webkit-scrollbar': {
                    width: '10px',
                    height: '10px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '5px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '5px',
                    '&:hover': {
                      background: '#555',
                    },
                  },
                },
              }}
            >
              <TableContainer component={Box}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                        sx={{
                          color: 'white',
                          '&.Mui-checked': {
                            color: 'white',
                          },
                          '&:hover': {
                            color: '#F5F5F5',
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: 'white',
                          },
                        }}
                          indeterminate={(() => {
                            const currentPageRows = filteredFinalizedData.slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            );
                            const selectableIds = currentPageRows
                              .filter(
                                (row) => !releasedIdSet.has(getRecordKey(row))
                              )
                              .map((row) => row.id);
                            const selectedOnPage = selectedRows.filter((id) =>
                              selectableIds.includes(id)
                            );
                            return (
                              selectedOnPage.length > 0 &&
                              selectedOnPage.length < selectableIds.length
                            );
                          })()}
                          checked={(() => {
                            const currentPageRows = filteredFinalizedData.slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            );
                            const selectableIds = currentPageRows
                              .filter(
                                (row) => !releasedIdSet.has(getRecordKey(row))
                              )
                              .map((row) => row.id);
                            if (selectableIds.length === 0) return false;
                            return selectableIds.every((id) =>
                              selectedRows.includes(id)
                            );
                          })()}
                          onChange={(e) => {
                            const currentPageRows = filteredFinalizedData.slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            );
                            const selectableIds = currentPageRows
                              .filter(
                                (row) => !releasedIdSet.has(getRecordKey(row))
                              )
                              .map((row) => row.id);
                            if (e.target.checked) {
                              setSelectedRows((prev) => [
                                ...new Set([...prev, ...selectableIds]),
                              ]);
                            } else {
                              setSelectedRows((prev) =>
                                prev.filter((id) => !selectableIds.includes(id))
                              );
                            }
                          }}
                        />
                      </TableCell>

                      <ExcelTableCell header>No.</ExcelTableCell>
                      <ExcelTableCell header>Department</ExcelTableCell>
                      <ExcelTableCell header>Employee Number</ExcelTableCell>
                      <ExcelTableCell header>Start Date</ExcelTableCell>
                      <ExcelTableCell header>End Date</ExcelTableCell>
                      <ExcelTableCell header>Name</ExcelTableCell>
                      <ExcelTableCell header>Position</ExcelTableCell>
                      <ExcelTableCell header>Rate NBC 584</ExcelTableCell>
                      <ExcelTableCell header>NBC 594</ExcelTableCell>
                      <ExcelTableCell header>Rate NBC 594</ExcelTableCell>
                      <ExcelTableCell header>NBC DIFF'L 597</ExcelTableCell>
                      <ExcelTableCell header>Increment</ExcelTableCell>
                      <ExcelTableCell header>Gross Salary</ExcelTableCell>
                      <ExcelTableCell header>
                        <b>Rendered Days &</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>
                        <b>ABS</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>H</ExcelTableCell>
                      <ExcelTableCell header>M</ExcelTableCell>

                      <ExcelTableCell header>Net Salary</ExcelTableCell>
                      <ExcelTableCell header>SSS</ExcelTableCell>
                      <ExcelTableCell header>Withholding Tax</ExcelTableCell>
                      <ExcelTableCell header>
                        <b>Total GSIS Deductions</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>
                        <b>Total Pag-ibig Deductions</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>PhilHealth</ExcelTableCell>
                      <ExcelTableCell header>
                        {' '}
                        <b>Total Other Deductions</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>
                        <b>Total Deductions</b>
                      </ExcelTableCell>
                      <ExcelTableCell header>1st Pay</ExcelTableCell>
                      <ExcelTableCell header>2nd Pay</ExcelTableCell>
                      <ExcelTableCell header>No.</ExcelTableCell>
                      <ExcelTableCell header>RT Ins.</ExcelTableCell>
                      <ExcelTableCell header>EC</ExcelTableCell>
                      <ExcelTableCell header>PhilHealth</ExcelTableCell>
                      <ExcelTableCell header>Pag-Ibig</ExcelTableCell>
                      <ExcelTableCell
                        header
                        style={{ borderLeft: '2px solid black' }}
                      >
                        Pay1st Compute
                      </ExcelTableCell>
                      <ExcelTableCell header>Pay2nd Compute</ExcelTableCell>
                      <ExcelTableCell
                        header
                        style={{ borderLeft: '2px solid black' }}
                      >
                        No.
                      </ExcelTableCell>
                      <ExcelTableCell header>Name</ExcelTableCell>
                      <ExcelTableCell>Position</ExcelTableCell>
                      <ExcelTableCell>Withholding Tax</ExcelTableCell>
                      <ExcelTableCell>Personal Life Ret Ins</ExcelTableCell>
                      <ExcelTableCell>GSIS Salary Loan</ExcelTableCell>
                      <ExcelTableCell>GSIS Policy Loan</ExcelTableCell>
                      <ExcelTableCell>gsisArrears</ExcelTableCell>
                      <ExcelTableCell>CPL</ExcelTableCell>
                      <ExcelTableCell>MPL</ExcelTableCell>
                      <ExcelTableCell> EAL</ExcelTableCell>
                      <ExcelTableCell>MPL LITE</ExcelTableCell>
                      <ExcelTableCell>Emergency Loan (ELA)</ExcelTableCell>
                      <ExcelTableCell>Total GSIS Deductions</ExcelTableCell>
                      <ExcelTableCell>
                        Pag-ibig Fund Contribution
                      </ExcelTableCell>
                      <ExcelTableCell>Pag-ibig 2</ExcelTableCell>
                      <ExcelTableCell>Multi-Purpose Loan</ExcelTableCell>
                      <ExcelTableCell>Total Pag-Ibig Deduction</ExcelTableCell>
                      <ExcelTableCell> PhilHealth</ExcelTableCell>
                      <ExcelTableCell> liquidatingCash</ExcelTableCell>
                      <ExcelTableCell>LandBank Salary Loan</ExcelTableCell>
                      <ExcelTableCell> Earist Credit COOP.</ExcelTableCell>
                      <ExcelTableCell> FEU</ExcelTableCell>
                      <ExcelTableCell> Total Other Deductions</ExcelTableCell>
                      <ExcelTableCell> Total Deductions</ExcelTableCell>
                      <ExcelTableCell>Date Submitted</ExcelTableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredFinalizedData.length > 0 ? (
                      filteredFinalizedData
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, index) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              '&:hover': {
                                backgroundColor: '#F5F5F5 !important',
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedRows.includes(row.id)}
                                disabled={releasedIdSet.has(getRecordKey(row))}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (releasedIdSet.has(getRecordKey(row)))
                                    return;
                                  if (selectedRows.includes(row.id)) {
                                    setSelectedRows((prev) =>
                                      prev.filter((id) => id !== row.id)
                                    );
                                  } else {
                                    setSelectedRows((prev) => [
                                      ...prev,
                                      row.id,
                                    ]);
                                  }
                                }}
                              />
                            </TableCell>
                            <ExcelTableCell>
                              {page * rowsPerPage + index + 1}
                            </ExcelTableCell>
                            <ExcelTableCell>{row.department}</ExcelTableCell>
                            <ExcelTableCell>
                              {row.employeeNumber}
                            </ExcelTableCell>
                            <ExcelTableCell>{row.startDate}</ExcelTableCell>
                            <ExcelTableCell>{row.endDate}</ExcelTableCell>
                            <ExcelTableCell>{row.name}</ExcelTableCell>
                            <ExcelTableCell>{row.position}</ExcelTableCell>
                            <ExcelTableCell>
                              {row.rateNbc584
                                ? Number(row.rateNbc584).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.nbc594
                                ? Number(row.nbc594).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.rateNbc594
                                ? Number(row.rateNbc594).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.nbcDiffl597
                                ? Number(row.nbcDiffl597).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.increment
                                ? Number(row.increment).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.grossSalary
                                ? Number(row.grossSalary).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.rh
                                ? (() => {
                                    const totalHours = Number(row.rh);
                                    const days = Math.floor(totalHours / 8);
                                    const hours = totalHours % 8;
                                    return `${days} days ${
                                      hours > 0 ? `& ${hours} hrs` : ''
                                    }`.trim();
                                  })()
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.abs
                                ? Number(row.abs).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>{row.h}</ExcelTableCell>
                            <ExcelTableCell>{row.m}</ExcelTableCell>
                            <ExcelTableCell>
                              {row.netSalary
                                ? Number(row.netSalary).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}{' '}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.sss
                                ? Number(row.sss).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.withholdingTax
                                ? Number(row.withholdingTax).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalGsisDeds
                                ? Number(row.totalGsisDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalPagibigDeds
                                ? Number(row.totalPagibigDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.PhilHealthContribution
                                ? Number(
                                    row.PhilHealthContribution
                                  ).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalOtherDeds
                                ? Number(row.totalOtherDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalDeductions
                                ? Number(row.totalDeductions).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell
                              sx={{ color: 'red', fontWeight: 'bold' }}
                            >
                              {row.pay1st
                                ? Number(row.pay1st).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}{' '}
                            </ExcelTableCell>
                            <ExcelTableCell
                              sx={{ color: 'red', fontWeight: 'bold' }}
                            >
                              {row.pay2nd
                                ? Number(row.pay2nd).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>{index + 1}</ExcelTableCell>
                            <ExcelTableCell>
                              {row.rtIns
                                ? Number(row.rtIns).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.ec
                                ? Number(row.ec).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.PhilHealthContribution
                                ? Number(
                                    row.PhilHealthContribution
                                  ).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.pagibigFundCont
                                ? Number(row.pagibigFundCont).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell
                              sx={{
                                borderLeft: '2px solid black',
                                color: 'red',
                                fontWeight: 'bold',
                              }}
                            >
                              {row.pay1stCompute
                                ? Number(row.pay1stCompute).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell
                              sx={{ color: 'red', fontWeight: 'bold' }}
                            >
                              {row.pay2ndCompute
                                ? Number(row.pay2ndCompute).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell
                              sx={{ borderLeft: '2px solid black' }}
                            >
                              {index + 1}
                            </ExcelTableCell>
                            <ExcelTableCell>{row.name}</ExcelTableCell>
                            <ExcelTableCell>{row.position}</ExcelTableCell>
                            <ExcelTableCell>
                              {row.withholdingTax
                                ? Number(row.withholdingTax).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.personalLifeRetIns
                                ? Number(row.personalLifeRetIns).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.gsisSalaryLoan
                                ? Number(row.gsisSalaryLoan).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.gsisPolicyLoan
                                ? Number(row.gsisPolicyLoan).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.gsisArrears
                                ? Number(row.gsisArrears).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.cpl
                                ? Number(row.cpl).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.mpl
                                ? Number(row.mpl).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.eal
                                ? Number(row.eal).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.mplLite
                                ? Number(row.mplLite).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.emergencyLoan
                                ? Number(row.emergencyLoan).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalGsisDeds
                                ? Number(row.totalGsisDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.pagibigFundCont
                                ? Number(row.pagibigFundCont).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.pagibig2
                                ? Number(row.pagibig2).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.multiPurpLoan
                                ? Number(row.multiPurpLoan).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalPagibigDeds
                                ? Number(row.totalPagibigDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.PhilHealthContribution
                                ? Number(
                                    row.PhilHealthContribution
                                  ).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.liquidatingCash
                                ? Number(row.liquidatingCash).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.landbankSalaryLoan
                                ? Number(row.landbankSalaryLoan).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.earistCreditCoop
                                ? Number(row.earistCreditCoop).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.feu
                                ? Number(row.feu).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalOtherDeds
                                ? Number(row.totalOtherDeds).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {row.totalDeductions
                                ? Number(row.totalDeductions).toLocaleString(
                                    'en-US',
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : ''}
                            </ExcelTableCell>
                            <ExcelTableCell>
                              {new Date(row.dateCreated).toLocaleString()}
                            </ExcelTableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <ExcelTableCell colSpan={13} align="center">
                          No finalized payroll records available.
                        </ExcelTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #E0E0E0',
                  px: 2,
                  py: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#6d2323' }}
                  >
                    Total Records: {filteredFinalizedData.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#6d2323' }}
                  >
                    Selected: {selectedRows.length}
                  </Typography>
                </Box>
                <TablePagination
                  component="div"
                  count={filteredFinalizedData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  sx={{
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows':
                      {
                        my: 'auto',
                      },
                  }}
                />
              </Box>
            </Paper>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                width: '150px', // Increased width for better button display
                height: getTableHeight(),
                display: 'flex',
                flexDirection: 'column',
                border: '3px solid #6d2323',
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderBottom: '2px solid black',
                  pb: '20px',
                  bgcolor: '#ffffff',
                  height: '12px', // Match table header height
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mt: '15px' }}
                >
                  Actions
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '10px',
                    height: '10px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '5px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '5px',
                    '&:hover': {
                      background: '#555',
                    },
                  },
                }}
              >
                {filteredFinalizedData.length > 0 ? (
                  filteredFinalizedData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          mt: '6px',
                          pb: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '2px solid #d1ceceff',
                          '&:nth-of-type(odd)': {
                            backgroundColor: '#FAFAFA',
                          },
                          '&:hover': {
                            backgroundColor: '#F5F5F5',
                          },
                        }}
                      >
                        <Button
                          onClick={() => {
                            if (selectedRows.includes(row.id)) {
                              // Bulk delete mode (delete all selected checkboxes)
                              initiateDelete(selectedRows);
                            } else {
                              // Single delete mode (delete only this row)
                              initiateDelete(row);
                            }
                          }}
                          variant="contained"
                          size="small"
                          startIcon={<DeleteIcon />}
                          disabled={
                            // Check if this specific row is released
                            (() => {
                              const key = `${row.employeeNumber}-${row.startDate}-${row.endDate}`;
                              const isRowReleased = releasedIdSet.has(key);

                              if (selectedRows.includes(row.id)) {
                                // If this row is selected, check if any selected rows are released
                                return selectedRows.some((id) => {
                                  const selectedRecord =
                                    filteredFinalizedData.find(
                                      (item) => item.id === id
                                    );
                                  if (!selectedRecord) return false;
                                  const selectedKey = `${selectedRecord.employeeNumber}-${selectedRecord.startDate}-${selectedRecord.endDate}`;
                                  return releasedIdSet.has(selectedKey);
                                });
                              } else {
                                // If this row is not selected, just check if this specific row is released
                                return isRowReleased;
                              }
                            })()
                          }
                          sx={{
                            bgcolor: '#6d2323',
                            minWidth: '10px',
                            px: 1,
                            '&:hover': {
                              bgcolor: '#A31D1D',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>No records</Box>
                )}
              </Box>
            </Paper>
          </Box>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
              gap: '12px',
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => (window.location.href = '/payroll-table')}
              size="medium"
              sx={{
                backgroundColor: '#ffffff',
                color: '#FFFFFF',
                textTransform: 'none',
                border: '1px solid #6d2323',

                '&:hover': {
                  backgroundColor: '#a31d1d',
                  color: 'white',
                },
              }}
              startIcon={<Pending />}
            >
              View Pending Payroll
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => (window.location.href = '/payroll-released')}
              size="medium"
              sx={{
                backgroundColor: '#ffffff',
                color: '#FFFFFF',
                textTransform: 'none',
                border: '1px solid #6d2323',

                '&:hover': {
                  backgroundColor: '#a31d1d',
                  color: 'white',
                },
              }}
              startIcon={<BusinessCenterIcon />}
            >
              View Released Payroll
            </Button>

            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={initiateRelease}
              disabled={selectedRows.length === 0}
              size="medium"
              sx={{
                bgcolor: selectedRows.length === 0 ? '#ccc' : '#6d2323',
                textTransform: 'none',
                color: 'WHITE',
                '&:hover': {
                  bgcolor: selectedRows.length === 0 ? '#ccc' : '#a31d1d',
                },
              }}
            >
              Release Selected ({selectedRows.length})
            </Button>
          </div>
        </Box>
      )}

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: {
            minWidth: '420px',
            maxWidth: '600px',
            borderRadius: '16px',
            p: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#6D2323',
            fontWeight: 'bold',
          }}
        >
          <DeleteForever sx={{ color: '#6D2323', fontSize: 30 }} />
          Delete Record Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1, color: 'black' }}>
            Please confirm that you want to delete{' '}
            <strong>
              {selectedRow?.isBulk
                ? `${selectedRow.ids.length} selected records`
                : 'this record'}
            </strong>
            . This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            sx={{
              color: 'black',
              borderColor: 'black',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f3f3f3' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#6D2323',
              color: 'white',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#8B2C2C' },
            }}
            startIcon={<DeleteForever />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* PASSKEY DIALOG */}
      <Dialog
        open={openPasskey}
        onClose={() => setOpenPasskey(false)}
        PaperProps={{
          sx: {
            minWidth: '300px',
            maxWidth: '500px',
            borderRadius: '16px',
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#6D2323',
            fontWeight: 'bold',
          }}
        >
          <Lock sx={{ color: '#6D2323', fontSize: 26 }} />
          Administrator Verification
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="black" sx={{ mb: 2 }}>
            Please enter the administrator passkey to authorize this deletion.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Passkey"
            type="password"
            fullWidth
            variant="outlined"
            value={passkeyInput}
            onChange={(e) => setPasskeyInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <Button
            onClick={() => setOpenPasskey(false)}
            variant="outlined"
            sx={{
              color: 'black',
              borderColor: 'black',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f3f3f3' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasskeySubmit}
            variant="contained"
            sx={{
              bgcolor: '#6D2323',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#8B2C2C' },
            }}
            startIcon={<Lock />}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* RELEASE PAYROLL RECORDS DIALOG */}
      <Dialog
        open={openReleaseConfirm}
        onClose={() => setOpenReleaseConfirm(false)}
        PaperProps={{
          sx: {
            minWidth: '420px',
            maxWidth: '600px',
            borderRadius: '16px',
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#6D2323',
            fontWeight: 'bold',
          }}
        >
          <CloudUpload sx={{ color: '#6D2323', fontSize: 30 }} />
          Release Payroll Records
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1, color: 'black' }}>
            Please confirm that you want to release{' '}
            <strong>{selectedRows.length}</strong> selected payroll record
            {selectedRows.length > 1 ? 's' : ''}. This action will move them to
            the <strong>Payroll Released</strong> module, and they will no
            longer be editable.
          </Typography>

          {/* OPTIONAL: subtle pulse line loader when releasing */}
          {releaseLoading && (
            <Box
              sx={{
                mt: 2,
                height: '4px',
                width: '100%',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #6D2323, #FEF9E1, #6D2323)',
                backgroundSize: '200% 100%',
                animation: 'pulseLine 1.5s linear infinite',
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <Button
            onClick={() => setOpenReleaseConfirm(false)}
            variant="outlined"
            sx={{
              color: 'black',
              borderColor: 'black',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f3f3f3' },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleReleasePayroll}
            variant="contained"
            disabled={releaseLoading}
            sx={{
              backgroundColor: '#6D2323',
              color: 'white',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#8B2C2C' },
            }}
            startIcon={
              releaseLoading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <CloudUpload />
              )
            }
          >
            {releaseLoading ? 'Releasing...' : 'Release'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 Add keyframes for the pulse line effect */}
      <style>
        {`
    @keyframes pulseLine {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}
      </style>

      {/* Loading and Success Overlays */}
      <LoadingOverlay
        open={overlayLoading || releaseLoading}
        message={releaseLoading ? 'Releasing...' : 'Processing...'}
      />
      <SuccessfulOverlay
        open={successOpen}
        action={successAction}
        onClose={() => setSuccessOpen(false)}
      />
    </Container>
  );
};

export default PayrollProcessed;


