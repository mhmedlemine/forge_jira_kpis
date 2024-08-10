import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ProjectStatistics = ({ statistics }) => {
  return (
    <div className="project-statistics">
      <Typography variant="h5">Project Statistics</Typography>
      <div className="statistics-cards">
        <Card>
          <CardContent>
            <Typography variant="h6">Total Projects</Typography>
            <Typography variant="h4">{statistics.totalProjects}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Active Projects</Typography>
            <Typography variant="h4">{statistics.activeProjects}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Completed Projects</Typography>
            <Typography variant="h4">{statistics.completedProjects}</Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectStatistics;