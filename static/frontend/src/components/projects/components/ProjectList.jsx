import React from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem } from '@mui/material';

const ProjectList = ({
  projects,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  filterValue,
  goToProjectDetails,
  setFilterValue,
  loading
}) => {
  return (
    <div className="project-list">
      <div className="project-search-filters">
        <TextField
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Search projects..."
        />
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Archived</MenuItem>
        </Select>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Project Lead</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No projects found.</TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.projectKey}>
                  <TableCell>
                    <Button variant="" onClick={() => goToProjectDetails(project.projectKey)}>
                      <a>{project.name}</a>
                    </Button>
                  </TableCell>
                  <TableCell>{project.projectKey}</TableCell>
                  <TableCell>{project.lead}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell>{project.projectType}</TableCell>
                  <TableCell className={project.archived ? 'inactive-status' : 'active-status'}>
                    {project.archived ? 'Archived' : 'Active'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ProjectList;