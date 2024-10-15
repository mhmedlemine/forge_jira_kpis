import api, { route } from "@forge/api";

export async function onProjectCreated(event, context) {
  const projectId = event.project.id;
  await setProjectStatus(projectId, "development");
}

async function setProjectStatus(projectId, status) {
  // const response = await api
  //   .asApp()
  //   .requestJira(
  //     route`/rest/api/3/project/${projectId}/properties/projectStatus`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status }),
  //     }
  //   );

  // if (response.status !== 200 && response.status !== 201) {
  //   console.error(`Failed to set project status for project ${projectId}`);
  // }
}
