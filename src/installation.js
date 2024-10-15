import api, { route } from "@forge/api";
import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('testInstallation', async (req) => {
  console.log('Test installation function called');
  console.log('Request:', JSON.stringify(req));

  // Your installation logic here
  // For example:
  // await someInstallationFunction();

  return {
    status: 'success',
    message: 'Test installation completed successfully'
  };
});

export const handler = resolver.getDefinitions();

// export async function handler(event) {
//   console.log('App installed event received');
//   console.log('Installation context:', event);
  
//   return {
//     status: 'success',
//     message: 'Installation completed successfully'
//   };
//   // const projects = await getAllProjects();
//   // for (const project of projects) {
//   //   await ensureProjectStatus(project.id);
//   // }
// }

async function getAllProjects() {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/project`);
  const data = await response.json();
  return data.values;
}

async function ensureProjectStatus(projectId) {
  try {
    const response = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/project/${projectId}/properties/projectStatus`
      );
    if (response.status === 404) {
      await setProjectStatus(projectId, "development");
    }
  } catch (error) {
    console.error(
      `Error ensuring project status for project ${projectId}:`,
      error
    );
  }
}
const defaultCheckList = {
    "checklist": [
      { "name": "Code review", "completed": false },
      { "name": "Testing", "completed": false },
    ]
}
async function setProjectStatus(projectId, status) {
  const response = await api
    .asApp()
    .requestJira(
      route`/rest/api/3/project/${projectId}/properties/projectStatus`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

  if (response.status !== 200 && response.status !== 201) {
    console.error(`Failed to set project status for project ${projectId}`);
  }
}
