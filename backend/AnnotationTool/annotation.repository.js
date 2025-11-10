const pool = require('../config/db');



async function saveAnnotation(projectId, imageId, annotatorId, labelClassId) {
  const query = `
    INSERT INTO annotations (project_id, image_id, annotator_id, label_class_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [projectId, imageId, annotatorId, labelClassId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getNextImage(projectId, annotatorId) {
  // Primary: unseen images
  const query1 = `
    SELECT i.*
    FROM project_images pi
    JOIN images i ON pi.image_id = i.id
    WHERE pi.project_id = $1
      AND i.id NOT IN (
        SELECT image_id
        FROM annotations
        WHERE project_id = $1 AND annotator_id = $2
      )
    ORDER BY i.id ASC
    LIMIT 1;
  `;
  let result = await pool.query(query1, [projectId, annotatorId]);

  if (result.rowCount > 0) return result.rows[0];

  // Fallback: previously skipped (null class)
  const query2 = `
    SELECT i.*
    FROM project_images pi
    JOIN images i ON pi.image_id = i.id
    WHERE pi.project_id = $1
      AND i.id IN (
        SELECT image_id
        FROM annotations
        WHERE project_id = $1
          AND annotator_id = $2
          AND label_class_id IS NULL
      )
    ORDER BY i.id ASC
    LIMIT 1;
  `;
  result = await pool.query(query2, [projectId, annotatorId]);

  return result.rows[0] || null;
}

module.exports = { getNextImage, saveAnnotation };
