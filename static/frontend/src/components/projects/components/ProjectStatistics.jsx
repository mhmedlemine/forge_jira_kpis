import React from 'react';
import { Paper, Grid, Card, CardContent, Typography } from '@mui/material';

const ProjectStatistics = ({ statistics }) => {
  return (
    <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h5">Project Statistics</Typography>
        <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                  <CardContent>
                    <Typography variant="h6">Total Projects</Typography>
                    <Typography variant="h4">{statistics.totalProjects}</Typography>
                  </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Active Projects</Typography>
                  <Typography variant="h4">{statistics.activeProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Completed Projects</Typography>
                  <Typography variant="h4">{statistics.completedProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
        </Grid>
    </Paper>
  );
};

export default ProjectStatistics;