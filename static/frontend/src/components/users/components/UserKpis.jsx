import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination, TextField, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const UserKpis = ({ userKpis, goToUserDetails }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredKpis = userKpis.filter(
        (kpi) => kpi.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Total Issues</TableCell>
                            <TableCell>Open Issues</TableCell>
                            <TableCell>Closed Issues</TableCell>
                            <TableCell>Avg Resolution Time</TableCell>
                            <TableCell>Cycle Time</TableCell>
                            <TableCell>Lead Time</TableCell>
                            <TableCell>Resolution Rate</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredKpis
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((kpi) => (
                                <TableRow key={kpi.user}>
                                    <TableCell>
                                        <Button variant="" onClick={() => goToUserDetails(kpi.user)}>
                                            <a>{kpi.user}</a>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{kpi.totalIssues}</TableCell>
                                    <TableCell>{kpi.openIssues}</TableCell>
                                    <TableCell>{kpi.closedIssues}</TableCell>
                                    <TableCell>{kpi.reopenRate}</TableCell>
                                    <TableCell>{kpi.cycleTime}</TableCell>
                                    <TableCell>{kpi.leadTime}</TableCell>
                                    <TableCell>{kpi.resolutionRate}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredKpis.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
}
export default UserKpis;
