import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Chart } from 'chart.js/auto';
import { helpers } from '../../../../utils/helpers';
import ChartComponent from '../../../ChartComponent';

const TeamMembers = ({ userKpis }) => {
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [noStatusHistory, setNoStatusHistory] = useState(false);

    useEffect(() => {
        if (userKpis.length > 0) {
            setSelectedKpi(userKpis[0]);
        }
    }, [userKpis]);

    useEffect(() => {
        if (!selectedKpi || Object.keys(selectedKpi.averageTimeInStatus).length === 0) {
            setNoStatusHistory(true);
        } else {
            setNoStatusHistory(false);
        }
    }, [selectedKpi]);

    const prepareStausTimeData = () => {
        if (!selectedKpi) {
            return {};
        }

        const data = Object.keys(selectedKpi.averageTimeInStatus).map(status => selectedKpi.averageTimeInStatus[status]);
        const labels = Object.keys(selectedKpi.averageTimeInStatus).map(status => status);

        return {
            labels: labels,
            datasets: [{
                label: 'Time In Status (days)',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    const prepareIssueAssigneeData = () => {
        const data = userKpis.map(kpi => kpi.totalIssues);
        const labels = userKpis.map(kpi => kpi.user);

        return {
            labels: labels,
            datasets: [{
                label: 'Total Issues',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    return (
        <div className="team-members">
            <h3>Team Members</h3>
            {userKpis.length === 0 ? (
                <div className="no-issues-message">No members found.</div>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Total Issues</TableCell>
                                    <TableCell>Open Issues</TableCell>
                                    <TableCell>Closed Issues</TableCell>
                                    <TableCell>Resolved Issues</TableCell>
                                    <TableCell>Cycle Time</TableCell>
                                    <TableCell>Lead Time</TableCell>
                                    <TableCell>Resolution Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userKpis.map((kpi) => (
                                    <TableRow key={kpi.user}>
                                        <TableCell>{kpi.user}</TableCell>
                                        <TableCell>{kpi.totalIssues}</TableCell>
                                        <TableCell>{kpi.openIssues}</TableCell>
                                        <TableCell>{kpi.closedIssues}</TableCell>
                                        <TableCell>{kpi.resolvedIssues}</TableCell>
                                        <TableCell>{kpi.cycleTime}</TableCell>
                                        <TableCell>{kpi.leadTime}</TableCell>
                                        <TableCell>{kpi.resolutionRate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Status Time Distribution</Typography>
                                <Select
                                    onChange={(e) => {
                                        setSelectedKpi(e.target.value);
                                    }}
                                    value={selectedKpi || ''}
                                >
                                    {userKpis.map((kpi) => (
                                        <MenuItem key={kpi.user} value={kpi}>
                                            {kpi.user}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {noStatusHistory ? (
                                    <Typography>No Status history.</Typography>
                                ) : (
                                    <ChartComponent type="pie" data={prepareStausTimeData()} />
                                )}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6">Issue Assignee Distribution</Typography>
                                <ChartComponent type="pie" data={prepareIssueAssigneeData()} />
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </div>
    );
}

export default TeamMembers;