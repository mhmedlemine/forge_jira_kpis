import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const UserIssues = ({ issues, projects }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedProject, setSelectedProject] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleProjectChange = (event) => {
        setSelectedProject(event.target.value);
    };

    const filterUserIssues = () => {
        
    };

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h5" gutterBottom>Assigned Issues </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project</InputLabel>
                <Select value={selectedProject} onChange={handleProjectChange}>
                    <MenuItem value="">All Projects</MenuItem>
                    {projects.map((project) => (
                        <MenuItem key={project.key} value={project.key}>{project.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Start Date"
                    value={dayjs(startDate)}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(params) => <TextField {...params} sx={{ mr: 2 }} />}
                />
                <DatePicker
                    label="End Date"
                    value={dayjs(endDate)}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(params) => <TextField {...params} sx={{ mr: 2 }} />}
                />
            </LocalizationProvider>
            <Button variant="contained" onClick={filterUserIssues} sx={{ mt: 2 }}>
                Get Issues
            </Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Summary</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Started</TableCell>
                            <TableCell>Resolved</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Story Points</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Sprint</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {issues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((issue) => (
                            <TableRow key={issue.key}>
                                <TableCell>{issue.key}</TableCell>
                                <TableCell>{issue.summary}</TableCell>
                                <TableCell>{issue.status}</TableCell>
                                <TableCell>{new Date(issue.updated).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(issue.created).toLocaleDateString()}</TableCell>
                                <TableCell>{issue.startdate ? new Date(issue.startdate).toLocaleDateString() : 'Not Yet'}</TableCell>
                                <TableCell>{issue.resolutiondate ? new Date(issue.resolutiondate).toLocaleDateString() : 'Not Yet'}</TableCell>
                                <TableCell>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'Not Set'}</TableCell>
                                <TableCell>{issue.issuetype}</TableCell>
                                <TableCell>{issue.storyPoints}</TableCell>
                                <TableCell>{issue.project}</TableCell>
                                <TableCell>{issue.sprint ? issue.sprint : 'No Sprint'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={issues.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {issues.length === 0 && (
                <Typography variant="body1" sx={{ mt: 2 }}>No issues found.</Typography>
            )}
        </Paper>
    );
};

export default UserIssues;