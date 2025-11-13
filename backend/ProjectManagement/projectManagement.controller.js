const projectManagementService = require('./projectManagement.service');

// Create Project
async function createProject(req, res) {
    try {
        const projectData = req.body;
        const newProject = await projectManagementService.createProject(projectData, req.user);
        
        res.status(201).json({
            success: true,
            data: newProject,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('Error creating project:', error);
        const statusCode = error.message.includes('permissions') ? 403 : 
                            error.message.includes('required') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// List Projects (role-based)
async function getProjects(req, res) {
    try {
        const projects = await projectManagementService.getProjects(req.user);
        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get Project Details
async function getProjectById(req, res) {
    try {
        const { id } = req.params;
        const project = await projectManagementService.getProjectById(id, req.user);
        
        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Get Project Details with relationships
async function getProjectDetails(req, res) {
    try {
        const { id } = req.params;
        const projectDetails = await projectManagementService.getProjectDetails(id, req.user);
        
        res.json({
            success: true,
            data: projectDetails
        });
    } catch (error) {
        console.error('Error fetching project details:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Assign Annotators to Project
async function assignAnnotators(req, res) {
    try {
        const { id } = req.params;
        const { annotator_ids } = req.body;
        
        const assignedAnnotators = await projectManagementService.assignAnnotators(id, annotator_ids, req.user);
        
        res.json({
            success: true,
            data: assignedAnnotators,
            message: 'Annotators assigned successfully'
        });
    } catch (error) {
        console.error('Error assigning annotators:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('permissions') ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Add Images to Project
async function addImagesToProject(req, res) {
    try {
        const { id } = req.params;
        const { image_ids } = req.body;
        
        const addedImages = await projectManagementService.addImagesToProject(id, image_ids, req.user);
        
        res.json({
            success: true,
            data: addedImages,
            message: 'Images added to project successfully'
        });
    } catch (error) {
        console.error('Error adding images to project:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('permissions') ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Remove Images from Project
async function removeImagesFromProject(req, res) {
    try {
        const { id } = req.params;
        const { image_ids } = req.body;
        
        const removedImages = await projectManagementService.removeImagesFromProject(id, image_ids, req.user);
        
        res.json({
            success: true,
            data: removedImages,
            message: 'Images removed from project successfully'
        });
    } catch (error) {
        console.error('Error removing images from project:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('permissions') ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Update Project
async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const projectData = req.body;
        
        const updatedProject = await projectManagementService.updateProject(id, projectData, req.user);
        
        res.json({
            success: true,
            data: updatedProject,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('permissions') ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Delete Project
async function deleteProject(req, res) {
    try {
        const { id } = req.params;
        
        const deletedProject = await projectManagementService.deleteProject(id, req.user);
        
        res.json({
            success: true,
            data: deletedProject,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                            error.message.includes('permissions') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Get available resources
async function getAvailableAnnotators(req, res) {
    try {
        const annotators = await projectManagementService.getAvailableAnnotators();
        res.json({
            success: true,
            data: annotators
        });
    } catch (error) {
        console.error('Error fetching available annotators:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

async function getAvailableImages(req, res) {
    try {
        const images = await projectManagementService.getAvailableImages();
        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Error fetching available images:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    getProjectDetails,
    assignAnnotators,
    addImagesToProject,
    removeImagesFromProject,
    updateProject,
    deleteProject,
    getAvailableAnnotators,
    getAvailableImages
};