import React from 'react';
import {
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Box
} from '@mui/material';

const ReportFilters = ({
    loadingFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    projects,
    selectedProject,
    setSelectedProject,
    users,
    selectedUser,
    setSelectedUser,
    issueTypes,
    selectedIssueType,
    setSelectedIssueType,
    sprints,
    selectedSprint,
    setSelectedSprint,
    priorities,
    selectedPriority,
    setSelectedPriority,
    statuses,
    selectedStatus,
    setSelectedStatus,
    labels,
    selectedLabel,
    setSelectedLabel,
    generateReport,
    filterPerProjects,
    filterPerUsers,
    filterPerSprints,
    isLoading,
}) => {
    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select
                        disabled={loadingFilters}
                        multiple
                        value={selectedProject}
                        onChange={(e) => filterPerProjects(e.target.value)}
                        label="Project"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={projects.find(p => p.key === value || p.projectKey === value)?.name} />
                                ))}
                            </Box>
                        )}
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.projectKey || project.key} value={project.projectKey || project.key}>
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>User</InputLabel>
                    <Select
                        disabled={loadingFilters}
                        multiple
                        value={selectedUser}
                        onChange={(e) => filterPerUsers(e.target.value)}
                        label="User"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={users.find(u => u.userKey === value || u.accountId === value)?.displayName} />
                                ))}
                            </Box>
                        )}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.userKey || user.accountId} value={user.userKey || user.accountId}>
                                {user.displayName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Issue Type</InputLabel>
                    <Select
                        disabled={loadingFilters}
                        multiple
                        value={selectedIssueType}
                        onChange={(e) => setSelectedIssueType(e.target.value)}
                        label="Issue Type"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {issueTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Sprint</InputLabel>
                    <Select
                        multiple
                        value={selectedSprint}
                        onChange={(e) => filterPerSprints(e.target.value)}
                        label="Sprint"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={sprints.find(s => s.id === value)?.name} />
                                ))}
                            </Box>
                        )}
                    >
                        {sprints.map((sprint) => (
                            <MenuItem key={sprint.id} value={sprint.id}>
                                {sprint.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        multiple
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        label="Priority"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {priorities.map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                        multiple
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        label="Status"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {(selectedProject.length == 1 && selectedProject[0].toLowerCase() == 'mm') &&<Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>Commercial Label</InputLabel>
                    <Select
                        multiple
                        value={selectedLabel}
                        onChange={(e) => setSelectedLabel(e.target.value)}
                        label="Commercial Label"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {labels.map((label) => (
                            <MenuItem key={label} value={label}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>}
            <Grid item xs={12}>
                <Button variant="contained" onClick={generateReport} fullWidth>
                    {isLoading ? 'Generating...' : loadingFilters ? 'Loading Filter Params' : 'Generate Report'}
                </Button>
            </Grid>
        </Grid>
    );
}
export default ReportFilters;