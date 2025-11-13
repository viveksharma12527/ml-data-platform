const pool = require('../config/db');

// Save Annotation
async function create(annotationData) {
    const { project_id, image_id, annotator_id, label_class_id } = annotationData;
    const query = `
        INSERT INTO annotations (project_id, image_id, annotator_id, label_class_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [project_id, image_id, annotator_id, label_class_id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Delete Annotation
async function deleteById(annotationId, annotatorId = null) {
    let query = `DELETE FROM annotations WHERE id = $1`;
    let values = [annotationId];
    
    // If annotatorId is provided, ensure the annotator can only delete their own annotations
    if (annotatorId) {
        query += ` AND annotator_id = $2`;
        values.push(annotatorId);
    }
    
    query += ` RETURNING *;`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Get Annotation by ID
async function findById(annotationId) {
    const query = `
        SELECT a.*, 
               i.filename as image_filename,
               i.s3_url as image_url,
               lc.name as label_class_name,
               lt.name as label_type_name,
               u.username as annotator_username
        FROM annotations a
        JOIN images i ON a.image_id = i.id
        JOIN label_classes lc ON a.label_class_id = lc.id
        JOIN label_types lt ON lc.label_type_id = lt.id
        JOIN users u ON a.annotator_id = u.id
        WHERE a.id = $1;
    `;
    const values = [annotationId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Get Annotations by Project and Annotator
async function findByProjectAndAnnotator(projectId, annotatorId) {
    const query = `
        SELECT a.*, 
               i.filename as image_filename,
               i.s3_url as image_url,
               lc.name as label_class_name,
               lt.name as label_type_name
        FROM annotations a
        JOIN images i ON a.image_id = i.id
        JOIN label_classes lc ON a.label_class_id = lc.id
        JOIN label_types lt ON lc.label_type_id = lt.id
        WHERE a.project_id = $1 AND a.annotator_id = $2
        ORDER BY a.created_at DESC;
    `;
    const values = [projectId, annotatorId];
    const result = await pool.query(query, values);
    return result.rows;
}

// Get Annotations by Project (for Data Specialist/Admin)
async function findByProject(projectId) {
    const query = `
        SELECT a.*, 
               i.filename as image_filename,
               i.s3_url as image_url,
               lc.name as label_class_name,
               lt.name as label_type_name,
               u.username as annotator_username,
               u.first_name as annotator_first_name,
               u.last_name as annotator_last_name
        FROM annotations a
        JOIN images i ON a.image_id = i.id
        JOIN label_classes lc ON a.label_class_id = lc.id
        JOIN label_types lt ON lc.label_type_id = lt.id
        JOIN users u ON a.annotator_id = u.id
        WHERE a.project_id = $1
        ORDER BY a.created_at DESC;
    `;
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows;
}

// Check if annotation exists
async function exists(annotationId) {
    const query = `SELECT 1 FROM annotations WHERE id = $1;`;
    const values = [annotationId];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

// Check if user has already annotated this image in this project
async function hasAnnotatedImage(projectId, imageId, annotatorId) {
    const query = `
        SELECT 1 FROM annotations 
        WHERE project_id = $1 AND image_id = $2 AND annotator_id = $3;
    `;
    const values = [projectId, imageId, annotatorId];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

// Get annotation statistics for a project
async function getProjectStats(projectId) {
    const query = `
        SELECT 
            COUNT(*) as total_annotations,
            COUNT(DISTINCT image_id) as annotated_images,
            COUNT(DISTINCT annotator_id) as active_annotators
        FROM (
            SELECT 
                image_id,
                annotator_id,
                COUNT(*) as annotation_count
            FROM annotations 
            WHERE project_id = $1
            GROUP BY image_id, annotator_id
        ) as annotation_counts;
    `;
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Get annotator statistics - needs refinement for the query
async function getAnnotatorStats(projectId, annotatorId) {
    const query = `
        SELECT 
            COUNT(*) as total_annotations,
            COUNT(DISTINCT image_id) as annotated_images,
            MIN(created_at) as first_annotation,
            MAX(created_at) as last_annotation
        FROM annotations 
        WHERE project_id = $1 AND annotator_id = $2;
    `;
    const values = [projectId, annotatorId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    create,
    deleteById,
    findById,
    findByProjectAndAnnotator,
    findByProject,
    exists,
    hasAnnotatedImage,
    getProjectStats,
    getAnnotatorStats
};





/*
    Amjed: I double-checked the queries and the repo : 13-Nov-25
 */