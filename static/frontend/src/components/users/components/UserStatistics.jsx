import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';

const UserStatistics = ({ totalUsers, activeUsers }) => (
    <Paper sx={{ p: 2, mt: 3 }}>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{totalUsers}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h6">Active Users</Typography>
                <Typography variant="h4">{activeUsers}</Typography>
            </Grid>
        </Grid>
    </Paper>
);
export default UserStatistics;
