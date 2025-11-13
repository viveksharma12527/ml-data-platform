const projectManagementRepo = require('./projectManagement.repository');

// Create Project
async function createProject(projectData, user) {
  try {
    const { name, description, label_type_id } = projectData;
    const { id: userId, role: roleId } = user;

    // Validation
    if (!name || name.trim().length === 0) {
      throw new Error('Project name is required');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Project description is required');
    }
    if (!label_type_id) {
      throw new Error('Label type is required');
    }

    // Only Data Specialist (2) can create projects
    if (roleId !== 2) {
      throw new Error('Only Data Specialist create projects');
    }

    const project = await projectManagementRepo.create({
      name,
      description,
      label_type_id,
      created_by: userId
    });

    return project;
  } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
  }
}

// Get Projects based on user role
async function getProjects(user) {
  try {
    const { id: userId, role: roleId } = user;
    
    // Data Specialist (2) - see all projects
    if (roleId === 2 ) {
      return await projectManagementRepo.findAll();
    }
    // Annotator (3) - see only assigned projects
    else if (roleId === 3) {
      return await projectManagementRepo.findByAnnotator(userId);
    }
    else if (roleId === 1 || roleId == 4) {
      throw new Error('Access denied for this user role');
    }
    else {
      throw new Error('Unknown user role');
    }
  } catch (error) {
      throw new Error(`Failed to retrieve projects: ${error.message}`);
  }
}

// Get Project Details with role-based access
async function getProjectById(projectId, user) {
  try {
    const { id: userId, role: roleId } = user;
    
    const project = await projectManagementRepo.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check access based on role
    if(roleId === 2) {
      return project;
    }
    else if (roleId === 3) {
      const isAssigned = await projectManagementRepo.isAnnotatorAssigned(projectId, userId);
      if (!isAssigned) {
        throw new Error('Access denied to this project');
      }
      return project;
    }
    else if (roleId == 1 || roleId == 4){
    throw new Error('Access denied for this user role'); 
    }
    else {
      throw new Error('Unknown user role');
    }
  } catch (error) {
    throw new Error(`Failed to retrieve project: ${error.message}`);
  }
}

// Assign Annotators to Project
async function assignAnnotators(projectId, annotatorIds, user) {
  try {
    const { role: roleId } = user;

    // Only Data Specialist (2) can assign annotators
    if (roleId !== 2) {
      throw new Error('Insufficient permissions to assign annotators');
    }

    // Check if project exists
    const projectExists = await projectManagementRepo.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }
    if (!annotatorIds || !Array.isArray(annotatorIds) || annotatorIds.length === 0) {
      throw new Error('Array of annotator IDs is required');
    }

    return await projectManagementRepo.assignAnnotators(projectId, annotatorIds);
  } catch (error) {
    throw new Error(`Failed to assign annotators: ${error.message}`);
  }
}

// Add Images to Project
async function addImagesToProject(projectId, imageIds, user) {
  try {
    const { role: roleId } = user;

    // Only Data Specialist (2) can add images
    if (roleId !== 2 ) {
      throw new Error('Insufficient permissions to add images to project');
    }

    // Check if project exists
    const projectExists = await projectManagementRepo.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      throw new Error('Array of image IDs is required');
    }

    return await projectManagementRepo.addImages(projectId, imageIds);
  } catch (error) {
      throw new Error(`Failed to add images to project: ${error.message}`);
  }
}

// Remove Images from Project
async function removeImagesFromProject(projectId, imageIds, user) {
  try {
    const { role: roleId } = user;

    // Only Data Specialist (2) can remove images
    if (roleId !== 2) {
      throw new Error('Insufficient permissions to remove images from project');
    }

    // Check if project exists
    const projectExists = await projectManagementRepo.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      throw new Error('Array of image IDs is required');
    }

    return await projectManagementRepo.removeImages(projectId, imageIds);
  } catch (error) {
    throw new Error(`Failed to remove images from project: ${error.message}`);
  }
}

// Update Project
async function updateProject(projectId, projectData, user) {
  try {
    const { role: roleId } = user;

    // Only Data Specialist (2) can update projects
    if (roleId !== 2) {
      throw new Error('Insufficient permissions to update project');
    }

    // Check if project exists
    const projectExists = await projectManagementRepo.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }

    const updatedProject = await projectManagementRepo.update(projectId, projectData);
    return updatedProject;
  } catch (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }
}

// Delete Project
async function deleteProject(projectId, user) {
  try {
    const { role: roleId } = user;

    // Only Data Specialist (2) can delete projects
    if (roleId !== 2) {
      throw new Error('Only Data Specialist can delete projects');
    }

    // Check if project exists
    const projectExists = await projectManagementRepo.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }

    const deletedProject = await projectManagementRepo.deleteProject(projectId);
    return deletedProject;
  } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
  }
}

// Get available resources     after implementing Mock images, user services or Image and User Management services
async function getAvailableAnnotators() {
  try {
    // return await projectManagementRepo.getAvailableAnnotators();
    return [];
  } catch (error) {
    throw new Error(`Failed to retrieve available annotators: ${error.message}`);
  }
}
async function getAvailableImages() {
  try {
    // return await projectManagementRepo.getAvailableImages();
    // return [{'id': 1, 'filename': 'mock'}];
    return []
  } catch (error) {
    throw new Error(`Failed to retrieve available images: ${error.message}`);
  }
}

// Get project details with relationships
async function getProjectDetails(projectId, user) {
  try {
    const project = await this.getProjectById(projectId, user);
    const images = await projectManagementRepo.getProjectImages(projectId);
    const annotators = await projectManagementRepo.getProjectAnnotators(projectId);

    return {
      ...project,
      images,
      annotators
    };
  } catch (error) {
    throw new Error(`Failed to retrieve project details: ${error.message}`);
  }
}

module.exports = { 
  createProject, 
  getProjects,
  getProjectById, 
  assignAnnotators, 
  addImagesToProject, 
  removeImagesFromProject, 
  updateProject, 
  deleteProject, 
  getAvailableAnnotators, 
  getAvailableImages,
  getProjectDetails
};