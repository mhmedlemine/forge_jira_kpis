import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import ChartComponent from '../../ChartComponent';

const ProjectCharts = ({ projects, categories }) => {




  const prepareProjectStatusData = () => {
    const data = [
      projects.filter(project => !project.archived).length,
      projects.filter(project => project.archived).length,
    ];
    const labels = ['Active', 'Inactive'];

    return {
      labels: labels,
      datasets: [{
        label: 'Status',
        data: data,
        backgroundColor: ['#4CAF50', '#F44336'],
      }]
    };
  };

  const prepareProjectCategoryData = () => {
    const data = categories.map(category =>
      projects.filter(project => project.category === category).length
    );
    const labels = categories;

    return {
      labels: labels,
      datasets: [{
        label: 'Projects',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    };
  };

  return (

    <Paper sx={{ p: 2, mt: 3 }}>


      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h6">Project Status Distribution</Typography>
          <ChartComponent type="pie" data={prepareProjectStatusData()} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6">Project Category Distribution</Typography>
          <ChartComponent type="bar" data={prepareProjectCategoryData()} />

        </Grid>
      </Grid>
    </Paper >

  );
};

export default ProjectCharts;