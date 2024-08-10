import React from 'react';

const ProjectOverview = ({ project }) => (
    <div className="project-overview">
        <div className="project-header">
            <div className="project-title">
                <h2>{project.name} <span className="project-key">({project.projectKey})</span></h2>
                <div className={`project-status ${project.archived ? 'status-completed' : 'status-in-progress'}`}>
                    {project.archived ? "Archived" : "Active"}
                </div>
            </div>
        </div>
        <div className="project-description">{project.description}</div>
        <div className="project-details">
            <p><strong>Project Lead:</strong> {project.lead}</p>
            <p><strong>Category:</strong> {project.category}</p>
            <p><strong>Type:</strong> {project.projectType}</p>
        </div>
    </div>
);

export default ProjectOverview;