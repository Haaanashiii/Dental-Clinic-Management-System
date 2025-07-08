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
                  {filteredAudits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((audit, idx) => {
                    let shortDetails = audit.details || "-";
                    if (shortDetails !== "-") {
                      const words = shortDetails.split(/\s+/);
                      if (words.length > 8) {
                        shortDetails = words.slice(0, 8).join(' ') + '...';
                      }
                    }
                    return (
                      <StyledTableRow key={audit._id || idx}>
                        <StyledTableCell>{audit.timestamp ? new Date(audit.timestamp).toLocaleString() : "-"}</StyledTableCell>
                        <StyledTableCell>{audit.userName || "-"}</StyledTableCell>
                        <StyledTableCell>{audit.role || "-"}</StyledTableCell>
                        <StyledTableCell>{audit.action || "-"}</StyledTableCell>
                        <StyledTableCell sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shortDetails}</StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
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
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
