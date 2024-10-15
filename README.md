# Smart MS Jira KPIs - Developer Documentation

  

## Table of Contents

1.  [Introduction](#introduction)

2.  [Project Structure](#project-structure)

3.  [Key Components](#key-components)

4.  [Data Flow](#data-flow)

5.  [API Integration](#api-integration)

6.  [KPI Calculations](#kpi-calculations)

7.  [Frontend Architecture](#frontend-architecture)

8.  [Backend Functions](#backend-functions)

9.  [Storage and Caching](#storage-and-caching)

10.  [Scheduled Tasks](#scheduled-tasks)

11.  [Security and Permissions](#security-and-permissions)

12.  [Troubleshooting and Debugging](#troubleshooting-and-debugging)

  

## 1. Introduction

  

Smart MS Jira KPIs is an Atlassian Forge app designed to calculate and display a set of Key Performance Indicators (KPIs) for Jira. This documentation provides technical details for developers working on or extending the app.

  

## 2. Project Structure

  

The project follows a typical Forge app structure with React for the frontend:

  

```

.

├── manifest.yml

├── src

│ ├── constants

│ └── utils

├── static

│ └── frontend

│ ├── build

│ ├── public

│ └── src

│ ├── components

│ ├── configuration

│ ├── projects

│ ├── reports

│ ├── users

│ ├── constants

│ └── utils

```

  

Key files:

-  `manifest.yml`: Defines app modules, permissions, and runtime configurations.

-  `src`: Contains backend logic and utilities.

-  `static/frontend`: Houses the React frontend application.

  

## 3. Key Components

  

### Backend

-  `jiraDataService.js`: Handles API calls to Jira.

-  `jiraDataParser.js`: Parses and structures data from Jira API responses.

-  `kpiCalculations.js`: Implements KPI calculation logic.

  

### Frontend

-  `App.js`: Main React component.

-  `AppRouter.js`: Manages routing for the app.

- Components for different views (Dashboard, Projects, Users, Reports).

  

## 4. Data Flow

  

1. User interacts with the frontend.

2. Frontend makes calls to Forge backend functions.

3. Backend functions use `jiraDataService` to fetch data from Jira API.

4.  `jiraDataParser` processes the raw data.

5.  `kpiCalculations` computes KPIs from the processed data.

6. Results are sent back to the frontend for display.

  

## 5. API Integration

  

The app uses Forge's `api` module to make authenticated requests to Jira's REST API. Key endpoints used:

  

-  `/rest/api/2/search`: Fetching issues

-  `/rest/api/2/project`: Retrieving project information

-  `/rest/api/2/user/search`: Getting user data

-  `/rest/agile/1.0/board`: Fetching board information

-  `/rest/agile/1.0/sprint`: Retrieving sprint data

  

Refer to `jiraDataService.js` for implementation details.

  

## 6. KPI Calculations

  

KPIs are defined in `kpiDefinitions.js` and calculated in `kpiCalculations.js`. Key KPIs include:

  

- Total Issues

- Closed Issues

- Resolution Rate

- Cycle Time

- Sprint Velocity

  

Extend these files to add new KPIs or modify existing calculations.

  

## 7. Frontend Architecture

  

The frontend is built with React and uses custom components for different views:

  

-  `Dashboard.jsx`: Main dashboard view

-  `Projects.jsx`: Project-specific views

-  `Users.jsx`: User-specific views

-  `Reports.jsx`: Reporting functionality

  

Custom hooks and context providers are used for state management and data fetching.

  

## 8. Backend Functions

  

Backend functions are defined in the `manifest.yml`:

  

-  `resolver`: Main function for handling frontend requests

-  `scheduled-task-email`: Handles scheduled report generation

-  `consumer-function`: Processes queued tasks

-  `installation-handler`: Manages app installation events

-  `project-created-handler`: Responds to new project creation

  

Implement these functions in separate files in the `src` directory.

  

## 9. Storage and Caching

  

The app uses Forge's storage API for caching and persisting data:

  

- Issues are stored in chunks to overcome storage limits.

- Use `cacheService.js` for managing cache operations.

  

## 10. Scheduled Tasks

  

A scheduled task runs hourly for report generation:

  

```yaml

scheduledTrigger:

-  key:  run-scheduled-reports

function:  scheduled-task-email

interval:  hour

```

  

Implement the logic for this in `scheduled-task.js`.

  

## 11. Security and Permissions

  

The app requests the following Jira scopes:

  

-  `read:jira-work`

-  `read:jira-user`

-  `read:sprint:jira-software`

-  `read:project:jira`

-  `write:jira-work`

-  `storage:app`

-  `manage:jira-configuration`

  

Ensure all data access adheres to these permission scopes.

  

## 12. Troubleshooting and Debugging

  

- Use `console.log()` for debugging backend functions.

- Implement error handling in API calls and data processing functions.

- Monitor Forge logs for runtime errors and performance issues.

  

For frontend debugging, use browser developer tools and React Developer Tools.