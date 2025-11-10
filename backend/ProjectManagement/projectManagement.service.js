const projectManagementRepo = require('./projectManagement.repository');

async function getAnnotatorProjects(annotatorId){
  const projects = await projectManagementRepo.getAnnotatorProjects(annotatorId);
  return projects;
}

async function getProjectById(projectId, annotatorId){
    const project = await projectManagementRepo.getProjectById(
        projectId,
        annotatorId
    );
    return project;
}

module.exports = { getAnnotatorProjects, getProjectById };