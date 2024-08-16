import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import { apiService } from '../../utils/api';
import ProjectList from './components/ProjectList';
import ProjectStatistics from './components/ProjectStatistics';
import ProjectCharts from './components/ProjectCharts';
import ProjectComparison from './components/ProjectComparison';

const Projects = ({ navigate }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [statistics, setStatistics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [projectKpis, setProjectKpis] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState('total-issues');

  useEffect(() => {
    getProjects();
    getProjectKpis();
  }, []);

  const getProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await apiService.fetchAllProjects();
      const categories = Array.from(new Set(projectsData.map(item => item.category)));

      setProjects(projectsData);
      setCategories(categories);
      setFilteredProjects(projectsData);
      getProjectStatistics(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    setLoading(false);
  };

  const getProjectKpis = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllProjectsKpis();
      console.log("projectKpis:", data);
      setProjectKpis(data);
    } catch (error) {
      console.error("Error getting all projects kpis:", error);
    }
    setLoadingKpis(false);
  }

  const getProjectStatistics = (projectsData) => {
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(project => !project.archived).length;
    const completedProjects = projectsData.filter(project => project.archived).length;
    setStatistics({ totalProjects, activeProjects, completedProjects });
  };

  const applyFilter = () => {
    let result = projects;
    if (filterValue) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        project.projectKey.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (selectedStatus) {
      result = result.filter(project => 
        selectedStatus === 'active' ? !project.archived : project.archived
      );
    }
    if (selectedCategory) {
      result = result.filter(project => project.category === selectedCategory);
    }
    setFilteredProjects(result);
  };

  useEffect(() => {
    applyFilter();
  }, [filterValue, selectedStatus, selectedCategory, projects]);

  const goToProjectDetails = (projectKey) => {
    navigate('project-details', { projectKey });
  };

  return (
    <div className="projects-container">
      <h1>Projects</h1>
      <ProjectList
        projects={filteredProjects}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        filterValue={filterValue}
        goToProjectDetails={goToProjectDetails}
        setFilterValue={setFilterValue}
        loading={loading}
      />
      <ProjectStatistics statistics={statistics} />

      {loadingKpis && <CircularProgress size={20} />}
      {!loadingKpis && <ProjectComparison projectKpis={projectKpis} selectedComparison={selectedComparison} setSelectedComparison={setSelectedComparison} />}
      
      <ProjectCharts projects={projects} categories={categories} />
    </div>
  );
};

export default Projects;