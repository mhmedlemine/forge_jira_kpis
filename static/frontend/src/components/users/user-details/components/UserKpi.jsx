import React from 'react';
import { Paper, Grid, Typography } from '@mui/material';

const UserKPI = ({ kpis, projectsCount }) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>Key Performance Indicators</Typography>
            <Grid container spacing={2}>
                <KPIItem title="Projects" value={projectsCount} />
                <KPIItem title="Total Issues" value={kpis.totalIssues} />
                <KPIItem title="Open Issues" value={kpis.openIssues} />
                <KPIItem title="Closed Issues" value={kpis.closedIssues} />
                <KPIItem title="Resolution Rate" value={`${kpis.resolutionRate}%`} />
                <KPIItem title="Cycle Time" value={`${kpis.cycleTime} days`} />
                <KPIItem title="Lead Time" value={`${kpis.leadTime} dasy`} />
            </Grid>
        </Paper>
    );
};

const KPIItem = ({ title, value }) => (
    <Grid item xs={12} sm={6} md={2}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h6">{value}</Typography>
    </Grid>
);

export default UserKPI;