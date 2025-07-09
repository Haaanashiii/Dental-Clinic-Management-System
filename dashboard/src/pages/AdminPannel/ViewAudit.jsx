/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import ClientSidebar from "../UserPannel/ClientSidebar";
import {
  Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField,
  tableCellClasses
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import api from '../../api';
import "./ViewAudit.css";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1c444d',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1c444d',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f3f3f3',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

export default function ViewAudit() {
  const [audits, setAudits] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for recent first, 'asc' for oldest first
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => { fetchAudits(); }, []);

  // Debounce search input (5 seconds after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 5000);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAudits = async () => {
    try {
      const { data } = await api.get(`${import.meta.env.VITE_API_BASE_URL}/audit`);
      setAudits(data);
    } catch (error) {
      console.error("ERROR fetching audits:", error);
    }
  };

  // Sort audits by timestamp (desc for recent first, asc for oldest first)
  const sortedAudits = useMemo(() => {
    return [...audits].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date);
      const dateB = new Date(b.timestamp || b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [audits, sortOrder]);

  // Filter by userName (debounced)
  const filteredAudits = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return sortedAudits.filter(audit =>
      (audit.userName && audit.userName.toLowerCase().includes(term))
    );
  }, [sortedAudits, debouncedSearch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(0);
  };

  return (
    <div className="audit-dashboard">
      <ClientSidebar />
      <motion.div 
        className="audit-profile-container"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header Section */}
        <motion.div 
          className="audit-profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="audit-profile-welcome"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Audit Logs
          </motion.h1>
          <motion.p 
            className="audit-profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            View and search audit trail records
          </motion.p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="audit-profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Search Bar and Sort Toggle */}
          <Box mb={2} display="flex" alignItems="center" style={{ maxWidth: 600, gap: 16 }}>
            <Box display="flex" alignItems="center" flex={1}>
              <SearchIcon style={{ marginRight: 8, color: '#1c444d' }} />
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by user name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
              />
            </Box>
            <Box ml={2} display="flex" alignItems="center">
              <IconButton
                onClick={handleSortToggle}
                sx={{ color: '#1c444d', border: '1px solid #1c444d', ml: 1 }}
                title={sortOrder === 'desc' ? 'Show Oldest First' : 'Show Newest First'}
              >
                {sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </IconButton>
            </Box>
          </Box>

          <motion.div 
            className="audit-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TableContainer component={Paper} sx={{ height: 600, maxHeight: 600, minHeight: 300, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>User Name</StyledTableCell>
                    <StyledTableCell>Role</StyledTableCell>
                    <StyledTableCell>Action</StyledTableCell>
                    <StyledTableCell>Details</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAudits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((audit, idx) => (
                    <StyledTableRow key={audit._id || idx}>
                      <StyledTableCell>{audit.timestamp ? new Date(audit.timestamp).toLocaleString() : "-"}</StyledTableCell>
                      <StyledTableCell>{audit.userName || "-"}</StyledTableCell>
                      <StyledTableCell>{audit.role || "-"}</StyledTableCell>
                      <StyledTableCell>{audit.action || "-"}</StyledTableCell>
                      <StyledTableCell sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Button
                          variant="text"
                          sx={{ color: '#1eb2a6', fontWeight: 600, textTransform: 'none', fontSize: 15, letterSpacing: 0.5 }}
                          onClick={() => { setSelectedAudit(audit); setModalOpen(true); }}
                        >
                          View Audit
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10]}
              component="div"
              count={filteredAudits.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
            {/* Audit Details Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ background: 'linear-gradient(90deg, #1eb2a6 0%, #1c444d 100%)', color: '#fff', fontWeight: 700, letterSpacing: 1, fontSize: 22, textAlign: 'center', pb: 2 }}>
                Audit Details
              </DialogTitle>
              <DialogContent sx={{ background: '#f8fafd', p: 4 }}>
                {selectedAudit && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #1eb2a6 30%, #1c444d 100%)',
                      borderRadius: 3,
                      p: 2,
                      minWidth: 320,
                      boxShadow: 3,
                      color: '#fff',
                      mb: 2,
                      textAlign: 'center',
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }}>{selectedAudit.userName || '-'}</Typography>
                      <Typography variant="subtitle2" sx={{ fontStyle: 'italic', opacity: 0.85 }}>{selectedAudit.role || '-'}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', background: '#fff', borderRadius: 2, p: 3, boxShadow: 1 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}><b>Date:</b> {selectedAudit.timestamp ? new Date(selectedAudit.timestamp).toLocaleString() : '-'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}><b>Action:</b> {selectedAudit.action || '-'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}><b>Details:</b></Typography>
                      <Box sx={{
                        background: '#f3f3f3',
                        borderRadius: 2,
                        p: 2,
                        fontFamily: 'monospace',
                        fontSize: 15,
                        color: '#1c444d',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxShadow: 0,
                      }}>
                        {selectedAudit.details || '-'}
                      </Box>
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ background: '#f8fafd', justifyContent: 'center', pb: 2 }}>
                <Button onClick={() => setModalOpen(false)} variant="contained" sx={{ background: '#1eb2a6', color: '#fff', fontWeight: 600, borderRadius: 2, px: 4, boxShadow: 2, '&:hover': { background: '#1c444d' } }}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
