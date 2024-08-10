import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button } from '@mui/material';

const IssueTable = ({ issues, userKpis }) => {
  const [selectedType, setSelectedType] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState(issues);

  const issueTypes = [...new Set(issues.map(issue => issue.issuetype))];
  const issueStatuses = [...new Set(issues.map(issue => issue.status))];
  const issueAssignees = ['Unassigned', ...userKpis.map(kpi => kpi.user)];

  const applyFilters = () => {
    setFilteredIssues(issues.filter(issue => 
      (selectedType.length === 0 || selectedType.includes(issue.issuetype)) &&
      (selectedStatus.length === 0 || selectedStatus.includes(issue.status)) &&
      (selectedAssignee.length === 0 || 
        (issue.assignee 
          ? selectedAssignee.includes(issue.assignee.displayName)
          : selectedAssignee.includes('Unassigned')
        )
      )
    ));
  };

  return (
    <div className="issue-filters">
      <h3>Issues</h3>
      <div>
        <Select
          multiple
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          displayEmpty
          renderValue={(selected) => selected.length === 0 ? 'Filter by Type' : selected.join(', ')}
        >
          {issueTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
        <Select
          multiple
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          displayEmpty
          renderValue={(selected) => selected.length === 0 ? 'Filter by Status' : selected.join(', ')}
        >
          {issueStatuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
        <Select
          multiple
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          displayEmpty
          renderValue={(selected) => selected.length === 0 ? 'Filter by Assignee' : selected.join(', ')}
        >
          {issueAssignees.map((assignee) => (
            <MenuItem key={assignee} value={assignee}>
              {assignee}
            </MenuItem>
          ))}
        </Select>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Sprint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Story Points</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Resolved</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.key}>
                <TableCell>{issue.key}</TableCell>
                <TableCell>{issue.summary}</TableCell>
                <TableCell>{issue.assignee ? issue.assignee.displayName : 'Unassigned'}</TableCell>
                <TableCell>{issue.sprint ? issue.sprint.name : 'No Sprint'}</TableCell>
                <TableCell>{issue.status}</TableCell>
                <TableCell>{issue.issuetype}</TableCell>
                <TableCell>{issue.storyPoints}</TableCell>
                <TableCell>{new Date(issue.created).toLocaleDateString()}</TableCell>
                <TableCell>{issue.started ? new Date(issue.started).toLocaleDateString() : 'Not Yet'}</TableCell>
                <TableCell>{issue.resolved ? new Date(issue.resolved).toLocaleDateString() : 'Not Yet'}</TableCell>
                <TableCell>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'Not Set'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredIssues.length === 0 && <div className="no-issues-message">No Issues found.</div>}
    </div>
  );
};

export default IssueTable;