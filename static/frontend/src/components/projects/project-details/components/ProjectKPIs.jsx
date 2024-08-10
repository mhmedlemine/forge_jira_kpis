import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const ProjectKPIs = ({ kpis }) => (
    <div className="project-kpis">
        <h3>Key Performance Indicators</h3>
        <div className="kpi-cards">
            <div className="kpi-card">
                <h4>Total Issues</h4>
                <p>{kpis["totalIssues"]}</p>
            </div>
            <div className="kpi-card">
                <h4>Open Issues</h4>
                <p>{kpis["openIssues"]}</p>
            </div>
            <div className="kpi-card">
                <h4>Closed Issues</h4>
                <p>{kpis["closedIssues"]}</p>
            </div>
        </div>
        <div className="project-progress">
            <h3>Project Progress</h3>
            <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={((kpis.closedIssues / kpis.totalIssues) * 100)} />
            </Box>
            <p>{kpis.closedIssues} / {kpis.totalIssues} issues completed</p>
            <div className="issue-status-counts">
                <p><strong>In Progress:</strong> {kpis.issuesInProgress}</p>
                <p><strong>Done:</strong> {kpis.closedIssues}</p>
            </div>
        </div>
    </div>
);

export default ProjectKPIs;