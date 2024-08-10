import React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const SprintOverview = ({ sprints, currentSprint, currentSprintTotalIssues, currentSprintClosedIssues }) => {

  return (
    <div className="sprint-overview">
      <h3>Current Sprint Overview</h3>
      {!currentSprint || sprints.length === 0 ? (
        <div className="sprint-details">No active sprints.</div>
      ) : (
        <>
          <div className="sprint-details">
            <p><strong>Sprint Name:</strong> {currentSprint.name}</p>
            <p><strong>Sprint Goal:</strong> {currentSprint.goal}</p>
            <p><strong>Start Date:</strong> {currentSprint.startDate}</p>
            <p><strong>End Date:</strong> {currentSprint.endDate}</p>
            <p><strong>Complete Date:</strong> {currentSprint.completeDate ? new Date(currentSprint.completeDate).toLocaleDateString() : 'Not completed'}</p>
            
            <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={((currentSprintClosedIssues / currentSprintTotalIssues) * 100)} />
            </Box>
            <p>{currentSprintClosedIssues} / {currentSprintTotalIssues} issues completed</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SprintOverview;