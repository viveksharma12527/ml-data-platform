const annotationService = require('./annotation.service');


// Save Annotation
async function createAnnotation(req, res) {
  try {
    const annotationData = req.body;
    const newAnnotation = await annotationService.createAnnotation(annotationData, req.user);
    
    res.status(201).json({
        success: true,
        data: newAnnotation,
        message: 'Annotation saved successfully'
    });
  } catch (error) {
      console.error('Error saving annotation:', error);
      const statusCode = error.message.includes('not assigned') ? 403 : 
                        error.message.includes('already annotated') ? 400 : 500;
      res.status(statusCode).json({
          success: false,
          error: error.message
      });
  }
}

// Delete Annotation
async function deleteAnnotation(req, res) {
  try {
    const { id } = req.params;
    const deletedAnnotation = await annotationService.deleteAnnotation(id, req.user);
    
    res.json({
        success: true,
        data: deletedAnnotation,
        message: 'Annotation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('only delete') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

// Get Annotations for a Project
async function getAnnotations(req, res) {
  try {
      const { projectId } = req.params;
      const annotations = await annotationService.getAnnotations(projectId, req.user);
      
      res.json({
          success: true,
          data: annotations
      });
  } catch (error) {
      console.error('Error fetching annotations:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('not assigned') ? 403 : 500;
      res.status(statusCode).json({
          success: false,
          error: error.message
      });
  }
}

// Get Annotation by ID
async function getAnnotationById(req, res) {
    try {
      const { id } = req.params;
      const annotation = await annotationService.getAnnotationById(id, req.user);
      
      res.json({
          success: true,
          data: annotation
      });
    } catch (error) {
        console.error('Error fetching annotation:', error);
        const statusCode = error.message.includes('not found') ? 404 : 
                          error.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Get Annotation Statistics
async function getAnnotationStats(req, res) {
  try {
    const { projectId } = req.params;
    const stats = await annotationService.getAnnotationStats(projectId, req.user);
    
    res.json({
        success: true,
        data: stats
    });
  } catch (error) {
    console.error('Error fetching annotation statistics:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('not assigned') ? 403 : 500;
    res.status(statusCode).json({
        success: false,
        error: error.message
    });
  }
}


module.exports = {
  createAnnotation,
  deleteAnnotation,
  getAnnotations,
  getAnnotationById,
  getAnnotationStats
};