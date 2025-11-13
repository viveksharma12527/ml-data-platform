const LabelTypeRepository = require('./labelTypeManagement.repository');


// List All Label Types
async function getAllLabelTypes() {
    try {
        return await LabelTypeRepository.findAll();
    } catch (error) {
        throw new Error(`Failed to retrieve label types: ${error.message}`);
    }
}

// Get Label Type Details with Classes
async function getLabelTypeDetails(labelTypeId) {
    try {
        const labelType = await LabelTypeRepository.findById(labelTypeId);
        if (!labelType) {
            throw new Error('Label type not found');
        }

        const classes = await LabelTypeRepository.findClassesByLabelTypeId(labelTypeId);
        
        return {
            ...labelType,
            classes
        };
    } catch (error) {
        throw new Error(`Failed to retrieve label type details: ${error.message}`);
    }
}

// Create Label Type
async function createLabelType(labelTypeData) {
    try {
        const { name, description } = labelTypeData;
        
        // Validation
        if (!name || name.trim().length === 0) {
            throw new Error('Label type name is required');
        }

        // Check if name already exists
        const nameExists = await LabelTypeRepository.nameExists(name);
        if (nameExists) {
            throw new Error('Label type name already exists');
        }

        return await LabelTypeRepository.create({ name, description });
    } catch (error) {
        throw new Error(`Failed to create label type: ${error.message}`);
    }
}

// Update Label Type
async function updateLabelType(labelTypeId, labelTypeData) {
    try {
        const { name, description } = labelTypeData;
        
        // Check if label type exists
        const labelTypeExists = await LabelTypeRepository.exists(labelTypeId);
        if (!labelTypeExists) {
            throw new Error('Label type not found');
        }

        // Validation
        if (!name || name.trim().length === 0) {
            throw new Error('Label type name is required');
        }

        // Check if name already exists (excluding current label type)
        const nameExists = await LabelTypeRepository.nameExists(name, labelTypeId);
        if (nameExists) {
            throw new Error('Label type name already exists');
        }

        return await LabelTypeRepository.update(labelTypeId, { name, description });
    } catch (error) {
        throw new Error(`Failed to update label type: ${error.message}`);
    }
}

// Delete Label Types
async function deleteLabelTypes(ids) {
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new Error('Array of label type IDs is required');
        }

        return await LabelTypeRepository.deleteByIds(ids);
    } catch (error) {
        throw new Error(`Failed to delete label types: ${error.message}`);
    }
}

// Add Class to Label Type
async function addClassToLabelType(labelTypeId, className) {
    try {
        // Check if label type exists
        const labelTypeExists = await LabelTypeRepository.exists(labelTypeId);
        if (!labelTypeExists) {
            throw new Error('Label type not found');
        }

        if (!className || className.trim().length === 0) {
            throw new Error('Class name is required');
        }

        return await LabelTypeRepository.addClass(labelTypeId, className);
    } catch (error) {
        throw new Error(`Failed to add class to label type: ${error.message}`);
    }
}

// Remove Class from Label Type
async function removeClassFromLabelType(labelTypeId, classId) {
    try {
        const deletedClass = await LabelTypeRepository.removeClass(labelTypeId, classId);
        if (!deletedClass) {
            throw new Error('Class not found in this label type');
        }
        return deletedClass;
    } catch (error) {
        throw new Error(`Failed to remove class from label type: ${error.message}`);
    }
}

// Get classes for label type
async function getLabelTypeClasses(labelTypeId) {
    try {
        const labelTypeExists = await LabelTypeRepository.exists(labelTypeId);
        if (!labelTypeExists) {
            throw new Error('Label type not found');
        }

        return await LabelTypeRepository.findClassesByLabelTypeId(labelTypeId);
    } catch (error) {
        throw new Error(`Failed to retrieve label type classes: ${error.message}`);
    }
}

module.exports = {
    getAllLabelTypes,
    getLabelTypeDetails,
    createLabelType,
    updateLabelType,
    deleteLabelTypes,
    addClassToLabelType,
    removeClassFromLabelType,
    getLabelTypeClasses
};