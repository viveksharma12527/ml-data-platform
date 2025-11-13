const AnnotationRepository = require('./annotation.repository');
const ProjectRepository = require('../ProjectManagement/projectManagement.repository');


// Save Annotation
async function createAnnotation(annotationData, user) {
  try {
    const { project_id, image_id, label_class_id } = annotationData;
    const { id: annotator_id, role: role_id} = user;

    // Validation
    if (!project_id || !image_id || !label_class_id) {
      throw new Error('Project ID, Image ID, and Label Class ID are required');
    }

    // Check if user is assigned to this project (for annotators)
    if (role_id === 3) { // Annotator role
        const isAssigned = await ProjectRepository.isAnnotatorAssigned(project_id, annotator_id);
        if (!isAssigned) {
          throw new Error('You are not assigned to this project');
        }
    }

   
    const annotation = await AnnotationRepository.create({
        project_id,
        image_id,
        annotator_id,
        label_class_id
    });

    return annotation;
  } catch (error) {
      throw new Error(`Failed to save annotation: ${error.message}`);
  }
}

// Delete Annotation
async function deleteAnnotation(annotationId, user) {
  try {
    const { id: userId, role: role_id} = user;

    // Check if annotation exists
    const annotationExists = await AnnotationRepository.exists(annotationId);
    if (!annotationExists) {
      throw new Error('Annotation not found');
    }

    let deletedAnnotation;
    console.log(role_id)
    // Annotators can only delete their own annotations
    if (role_id === 3) { 
      deletedAnnotation = await AnnotationRepository.deleteById(annotationId, userId);
      if (!deletedAnnotation) {
        throw new Error('You can only delete your own annotations');
      }
    }
    else {
      throw new Error('Insufficient permissions');
    }

    return deletedAnnotation;
  } catch (error) {
      throw new Error(`Failed to delete annotation: ${error.message}`);
  }
}

// Get Annotations (role-based access)
async function getAnnotations(projectId, user) {
  try {
    const { id: userId, role: role_id} = user;

    // Check if project exists
    const projectExists = await ProjectRepository.exists(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }
    
    // Data specialist and ML Engineer can see all annotations in the project
    if (role_id === 2 || role_id === 4) { 
      return await AnnotationRepository.findByProject(projectId);
    }
    // Annotators can only see their own annotations
    else if (role_id === 3) {
      const isAssigned = await ProjectRepository.isAnnotatorAssigned(projectId, userId);
      if (!isAssigned) {
        throw new Error('You are not assigned to this project');
      }
      return await AnnotationRepository.findByProjectAndAnnotator(projectId, userId);
    }
    else {
      throw new Error('Insufficient permissions');
    }
  } catch (error) {
      throw new Error(`Failed to retrieve annotations: ${error.message}`);
  }
}

// Get Annotation by ID with role-based access
async function getAnnotationById(annotationId, user) {
  try {
    const { id: userId, role: role_id} = user;

    const annotation = await AnnotationRepository.findById(annotationId);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    // Check access based on role
    if (role_id === 2 || role_id === 4) { // Data Specialist or ML Engineer
        return annotation;
    }
    else if (role_id === 3) { // Annotator - only their annotations
        if (annotation.annotator_id !== userId) {
          throw new Error('Access denied to this annotation');
        }
        return annotation;
    }
    else {
      throw new Error('Insufficient permissions');
    }
  } catch (error) {
    throw new Error(`Failed to retrieve annotation: ${error.message}`);
  }
}

// Get annotation statistics
async function getAnnotationStats(projectId, user) {
  try {
    const { id: userId, role: role_id} = user;

    // Check project access
    if (role_id === 3) { // Annotator
      const isAssigned = await ProjectRepository.isAnnotatorAssigned(projectId, userId);
      if (!isAssigned) {
          throw new Error('You are not assigned to this project');
      }
      return await AnnotationRepository.getAnnotatorStats(projectId, userId);
    }
    else if (role_id === 2 || role_id === 4) { // Data Specialist or ML Engineer
      const projectExists = await ProjectRepository.exists(projectId);
      if (!projectExists) {
        throw new Error('Project not found');
      }
                  
      return await AnnotationRepository.getProjectStats(projectId);
    }
    else {
      throw new Error('Insufficient permissions');
    }
  } catch (error) {
      throw new Error(`Failed to retrieve annotation statistics: ${error.message}`);
  }
}


module.exports = {
  createAnnotation,
  deleteAnnotation,
  getAnnotations,
  getAnnotationById,
  getAnnotationStats 
};