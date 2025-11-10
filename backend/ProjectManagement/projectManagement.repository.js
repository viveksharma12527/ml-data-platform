const pool = require('../config/db');

async function getAnnotatorProjects(annotatorId) {
  const query = `
    SELECT p.* FROM annotation_projects p 
    INNER JOIN project_assignments pa ON p.id = pa.project_id 
    WHERE pa.annotator_id = $1;
  `;
  const values = [annotatorId];
  const result = await pool.query(query, values);
  return result.rows;
}

async function getProjectById(projectId, annotatorId) {
  const query = `
    SELECT p.* FROM annotation_projects p 
    INNER JOIN project_assignments pa ON p.id = pa.project_id 
    WHERE pa.annotator_id = $1 AND p.id = $2;
  `;
  const result = await pool.query(query, [annotatorId,projectId]);

  return result.rows[0] || null;
}

module.exports = { getAnnotatorProjects, getProjectById };
