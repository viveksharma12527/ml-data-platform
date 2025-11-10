const projectManagementService = require('./projectManagement.service');


async function getAnnotatorProjects(req, res){
    try {
      const annotator_id = req.user.id;
        
      const projects = await projectManagementService.getAnnotatorProjects(annotator_id);
      res.status(200).json(projects);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error failed to retrieve projects' });
    }
};


async function getProjectById(req, res){
    try {
        const annotator_id = req.user.id;
        const project_id = req.params.projectId;

        if( !project_id)
            res.status(400).json({ error: 'Missing required parameters' });
        const project = await projectManagementService.getProjectById(project_id,annotator_id);
        if (!project) 
          return res.status(404).json({ error: 'Project not found or not assigned to this annotator' });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error failed to retrieve the project' });
    }
};

module.exports = { getAnnotatorProjects, getProjectById };