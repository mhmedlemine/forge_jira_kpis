import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { helpers } from '../../../../utils/helpers';
import ChartComponent from '../../../ChartComponent';

const IssueDistribution = ({ statusCount, typeCount }) => {

    const prepareStatusData = () => {
        const data = Object.values(statusCount);
        const labels = Object.keys(statusCount);

        return {
            labels: labels,
            datasets: [{
                label: 'Issues',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };
    const prepareTypeData = () => {
        const labels = Object.keys(typeCount);
        const data = Object.values(typeCount);

        return {
            labels: labels,
            datasets: [{
                label: 'Issues',
                data: data,
                backgroundColor: labels.map(() => helpers.random_rgba()),
            }]
        };
    };

    return (
        <>
        <Typography variant="h4">Issue Distribution</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Issue Type Distribution</Typography>
                    <ChartComponent type="pie" data={prepareTypeData()} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Issue Status Distribution</Typography>
                    <ChartComponent type="pie" data={prepareStatusData()} />
                </Paper>
            </Grid>
        </Grid>
        </>
    );
};

export default IssueDistribution;