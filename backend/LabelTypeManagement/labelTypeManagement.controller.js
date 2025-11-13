const LabelTypeService = require('./labelTypeManagement.service');

// List All Label Types
async function listAllLabelTypes(req, res) {
    try {
        const labelTypes = await LabelTypeService.getAllLabelTypes();
        res.json({
            success: true,
            data: labelTypes
        });
    } catch (error) {
        console.error('Error listing label types:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get Label Type Details
async function getLabelTypeDetails(req, res) {
    try {
        const { id } = req.params;
        const labelTypeDetails = await LabelTypeService.getLabelTypeDetails(id);
        
        res.json({
            success: true,
            data: labelTypeDetails
        });
    } catch (error) {
        console.error('Error fetching label type details:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Create Label Type
async function createLabelType(req, res) {
    try {
        const { name, description } = req.body;
        const newLabelType = await LabelTypeService.createLabelType({ name, description });
        
        res.status(201).json({
            success: true,
            data: newLabelType,
            message: 'Label type created successfully'
        });
    } catch (error) {
        console.error('Error creating label type:', error);
        const statusCode = error.message.includes('already exists') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Update Label Type
async function updateLabelType(req, res) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const updatedLabelType = await LabelTypeService.updateLabelType(id, { name, description });
        
        res.json({
            success: true,
            data: updatedLabelType,
            message: 'Label type updated successfully'
        });
    } catch (error) {
        console.error('Error updating label type:', error);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Delete Label Types
async function deleteLabelTypes(req, res) {
    try {
        const { ids } = req.body;
        
        const deletedLabelTypes = await LabelTypeService.deleteLabelTypes(ids);
        
        res.status(204).json({
            success: true,
            data: deletedLabelTypes,
            message: `Successfully deleted ${deletedLabelTypes.length} label type(s)`
        });
    } catch (error) {
        console.error('Error deleting label types:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

// Add Class to Label Type
async function addClassToLabelType(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        const newClass = await LabelTypeService.addClassToLabelType(id, name);
        
        res.status(201).json({
            success: true,
            data: newClass,
            message: 'Class added successfully'
        });
    } catch (error) {
        console.error('Error adding class to label type:', error);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Remove Class from Label Type
async function removeClassFromLabelType(req, res) {
    try {
        const { id, classId } = req.params;
        
        const deletedClass = await LabelTypeService.removeClassFromLabelType(id, classId);
        
        res.json({
            success: true,
            data: deletedClass,
            message: 'Class removed successfully'
        });
    } catch (error) {
        console.error('Error removing class from label type:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}

// Get classes for label type
async function getLabelTypeClasses(req, res) {
    try {
        const { id } = req.params;
        const classes = await LabelTypeService.getLabelTypeClasses(id);
        
        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Error fetching label type classes:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
}


module.exports = { 
    listAllLabelTypes,
    getLabelTypeDetails,
    createLabelType,
    updateLabelType,
    deleteLabelTypes,
    addClassToLabelType,
    removeClassFromLabelType,
    getLabelTypeClasses
};