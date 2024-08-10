import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import ChartComponent from '../../../ChartComponent';
import { helpers } from '../../../../utils/helpers';

const IssueDistributionCharts = ({ issues, kpis, issuesByType, resolutionTimes }) => {
    const prepareStatusTimeData = () => {
        const data = Object.values(kpis.averageTimeInStatus);
        const labels = Object.keys(kpis.averageTimeInStatus);
        return {
            labels: labels,
            datasets: [{
                label: 'Time In Status (days)',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    const prepareIssueTypeData = () => {
        if (!issuesByType) {
            issuesByType = issues.reduce((acc, issue) => {
                acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
                return acc;
            }, {});
        }
        const data =  Object.values(issuesByType);
        const labels =  Object.keys(issuesByType);
        return {
            labels: labels,
            datasets: [{
                label: 'Issue Type',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    const prepareResolutionTimeData = () => {
        if (!resolutionTimes) {
            resolutionTimes = issues.reduce((acc, issue) => {
                if (issue.resolutiondate) {
                    const resolutionTime = (new Date(issue.resolutiondate) - new Date(issue.created)) / (1000 * 60 * 60 * 24);
                    acc[issue.issuetype] = (acc[issue.issuetype] || []).concat(resolutionTime);
                }
                return acc;
            }, {});
        }

        const avgResolutionTimes = Object.entries(resolutionTimes).reduce((acc, [type, times]) => {
            acc[type] = times.reduce((sum, time) => sum + time, 0) / times.length;
            return acc;
        }, {});


        const data = Object.values(avgResolutionTimes);
        const labels = Object.keys(avgResolutionTimes);

        return {
            labels: labels,
            datasets: [{
                label: 'Resolution Time (days)',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Status Time Distribution</Typography>
                    <ChartComponent type="pie" data={prepareStatusTimeData()} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Issue Type Distribution</Typography>
                    <ChartComponent type="pie" data={prepareIssueTypeData()} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Resolution Time Type Distribution (Days)</Typography>
                    <ChartComponent type="pie" data={prepareResolutionTimeData()} />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default IssueDistributionCharts;