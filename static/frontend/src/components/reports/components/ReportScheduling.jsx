import React, { useState, useEffect } from 'react';
import {
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { apiService } from '../../../utils/api';

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednsday", "Thursday", "Firaday", "Saturday"];

const ReportScheduling = ({ filters }) => {
    const [scheduledReports, setScheduledReports] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [reportName, setReportName] = useState('');
    const [frequency, setFrequency] = useState('');
    const [weekDay, setWeekDay] = useState(new Date().getDay());
    const [monthDay, setMonthDay] = useState(new Date().getMonth() + 1);
    const [time, setTime] = useState('');
    const [recipients, setRecipients] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchScheduledReports();
    }, []);

    const fetchScheduledReports = async () => {
        try {
            const reports = await apiService.getScheduledReports();
            setScheduledReports(reports);
        } catch (error) {
            console.error('Error fetching scheduled reports:', error);
        }
    };

    const handleScheduleReport = async () => {
        try {
            const reportData = {
                name: reportName,
                frequency,
                weekDay,
                monthDay,
                time,
                recipients: recipients.split(',').map(email => email.trim()),
                filters,
            };

            if (editingReport) {
                await apiService.updateScheduledReport(editingReport.id, reportData);
            } else {
                await apiService.createScheduledReport(reportData);
            }

            handleCloseDialog();
            fetchScheduledReports();
        } catch (error) {
            console.error('Error scheduling report:', error);
        }
    };

    const handleDeleteReport = async (reportId) => {
        setLoading(true);
        try {
            await apiService.deleteScheduledReport(reportId);
            fetchScheduledReports();
        } catch (error) {
            console.error('Error deleting scheduled report:', error);
        }
        setLoading(false);
    };

    const handleEditReport = (report) => {
        setEditingReport(report);
        setReportName(report.name);
        setFrequency(report.frequency);
        setTime(report.time);
        setRecipients(report.recipients.join(', '));
        setOpenDialog(true);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReport(null);
        setReportName('');
        setFrequency('');
        setTime('');
        setRecipients('');
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Scheduled Reports</Typography>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenDialog}
                sx={{ mb: 2 }}
            >
                Schedule New Report
            </Button>
            <List>
                {scheduledReports.map((report) => (
                    <ListItem key={report.id}>
                        <ListItemText
                            primary={report.name}
                            secondary={`${report.frequency}, ${report.frequency !== 'Daily' ? report.frequency === 'Weekly' ? weekDay[weekDay] : monthDay : ''} at ${report.time}`}
                        />
                        {loading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditReport(report)}>
                                    <Edit />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteReport(report.id)}>
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editingReport ? 'Edit Scheduled Report' : 'Schedule New Report'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Report Name"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    value={frequency}
                                    label="Frequency"
                                    onChange={(e) => setFrequency(e.target.value)}
                                >
                                    <MenuItem value="Daily">Daily</MenuItem>
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                    <MenuItem value="Monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {frequency === 'Weekly' &&<Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Week Day</InputLabel>
                                <Select
                                    value={weekDay}
                                    label="Week Day"
                                    onChange={(e) => setWeekDay(e.target.value)}
                                >
                                    <MenuItem value="1">Monday</MenuItem>
                                    <MenuItem value="2">Tuesday</MenuItem>
                                    <MenuItem value="3">Wednsday</MenuItem>
                                    <MenuItem value="4">Thursday</MenuItem>
                                    <MenuItem value="5">Firaday</MenuItem>
                                    <MenuItem value="6">Saturday</MenuItem>
                                    <MenuItem value="0">Sunday</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>}
                        {frequency === 'Monthly' &&<Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Month Day</InputLabel>
                                <Select
                                    value={monthDay}
                                    label="Month Day"
                                    onChange={(e) => setMonthDay(e.target.value)}
                                >
                                    {[...Array(31)].map((e, i) => (<MenuItem value={i+1}>{i+1}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Hour of the day</InputLabel>
                                <Select
                                    value={time}
                                    label="Hour of day"
                                    onChange={(e) => setTime(e.target.value)}
                                >
                                    {[...Array(24)].map((e, i) => (<MenuItem value={i}>{i < 10 ? `0${i}` : i}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Recipients"
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                placeholder="Comma-separated emails"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleScheduleReport} variant="contained">
                        {editingReport ? 'Update' : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
export default ReportScheduling;