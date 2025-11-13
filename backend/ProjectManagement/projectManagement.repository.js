const pool = require('../config/db');

// Create Project checked
async function create(projectData) {
    const { name, description, label_type_id, created_by } = projectData;
    const query = `
        INSERT INTO annotation_projects (name, description, label_type_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [name, description, label_type_id, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Find All Projects (for Data Specialist/Admin)
async function findAll() {
    const query = `
        SELECT p.*, 
                u.username as created_by_username,
                lt.name as label_type_name,
                COUNT(DISTINCT pa.annotator_id) as annotator_count,
                COUNT(DISTINCT pi.image_id) as image_count
        FROM annotation_projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN label_types lt ON p.label_type_id = lt.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        GROUP BY p.id, u.username, lt.name
        ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
}

// Find Projects by Annotator
async function findByAnnotator(annotatorId) {
    const query = `
        SELECT p.*, 
                u.username as created_by_username,
                lt.name as label_type_name,
                COUNT(DISTINCT pi.image_id) as image_count,
                COUNT(DISTINCT a.id) as annotation_count
        FROM annotation_projects p
        INNER JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN label_types lt ON p.label_type_id = lt.id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        LEFT JOIN annotations a ON p.id = a.project_id AND a.annotator_id = $1
        WHERE pa.annotator_id = $1 AND p.status = 'active'
        GROUP BY p.id, u.username, lt.name
        ORDER BY p.created_at DESC;
    `;
    const values = [annotatorId];

    const result = await pool.query(query, values);
    return result.rows;
}

// Find Projects by Creator (ML Engineer)
async function findByCreator(creatorId) {
    const query = `
        SELECT p.*, 
                lt.name as label_type_name,
                COUNT(DISTINCT pa.annotator_id) as annotator_count,
                COUNT(DISTINCT pi.image_id) as image_count
        FROM annotation_projects p
        LEFT JOIN label_types lt ON p.label_type_id = lt.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE p.created_by = $1
        GROUP BY p.id, lt.name
        ORDER BY p.created_at DESC;
    `;
    const values = [creatorId];
    const result = await pool.query(query, values);
    return result.rows;
}

// Find Project by ID
async function findById(projectId) {
    const query = `
        SELECT p.*, 
                u.username as created_by_username,
                u.email as created_by_email,
                lt.name as label_type_name,
                lt.description as label_type_description
        FROM annotation_projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN label_types lt ON p.label_type_id = lt.id
        WHERE p.id = $1;
    `;
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Check if annotator is assigned to project
async function isAnnotatorAssigned(projectId, annotatorId) {
    const query = `
        SELECT 1 FROM project_assignments 
        WHERE project_id = $1 AND annotator_id = $2;
    `;
    const values = [projectId, annotatorId];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

// Add Images to Project
async function addImages(projectId, imageIds) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        for (const imageId of imageIds) {
            await client.query(`
                INSERT INTO project_images (project_id, image_id)
                VALUES ($1, $2)
                ON CONFLICT (project_id, image_id) DO NOTHING;
            `, [projectId, imageId]);
        }
        
        await client.query('COMMIT');
        
        // Return added images
        const result = await client.query(`
            SELECT i.* 
            FROM project_images pi
            JOIN images i ON pi.image_id = i.id
            WHERE pi.project_id = $1;
        `, [projectId]);
        
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Remove Images from Project
async function removeImages(projectId, imageIds) {
    const query = `
        DELETE FROM project_images 
        WHERE project_id = $1 AND image_id = ANY($2::int[])
        RETURNING *;
    `;
    const values =  [projectId, imageIds];
    const result = await pool.query(query, values);
    return result.rows;
}

// Get Project Images
async function getProjectImages(projectId) {
    const query = `
        SELECT i.* 
        FROM project_images pi
        JOIN images i ON pi.image_id = i.id
        WHERE pi.project_id = $1
        ORDER BY i.uploaded_at DESC;
    `; 
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows;
}

// Get Project Annotators
async function getProjectAnnotators(projectId) {
    const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name
        FROM project_assignments pa
        JOIN users u ON pa.annotator_id = u.id
        WHERE pa.project_id = $1
        ORDER BY u.username;
    `;
    const values =  [projectId];
    const result = await pool.query(query, values);
    return result.rows;
}

// Assign Annotators to Project
async function assignAnnotators(projectId, annotatorIds) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert new assignments
      for (const annotatorId of annotatorIds) {
          await client.query(`
              INSERT INTO project_assignments (project_id, annotator_id)
              VALUES ($1, $2)
              ON CONFLICT (project_id, annotator_id) DO NOTHING;
          `, [projectId, annotatorId]);
      }
      
      await client.query('COMMIT');
      
      // Return assigned annotators
      const result = await client.query(`
          SELECT u.id, u.username, u.email, u.role_id
          FROM project_assignments pa
          JOIN users u ON pa.annotator_id = u.id
          WHERE pa.project_id = $1;
      `, [projectId]);
      
      return result.rows;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
}

// Remove annotators from project
async function removeAnnotators(projectId, annotatorIds) {
    const query = `
        DELETE FROM project_assignments 
        WHERE project_id = $1 AND annotator_id = ANY($2::int[])
        RETURNING *;
    `;
    const values = [projectId, annotatorIds];
    const result = await pool.query(query, values);
    return result.rows;
}

// Update Project
async function update(projectId, projectData) {
    const { name, description, label_type_id, status } = projectData;
    
    const query = `
        UPDATE annotation_projects 
        SET name = $1, description = $2, label_type_id = $3, status = $4
        WHERE id = $5
        RETURNING *;
    `;
    const values = [name, description, label_type_id, status, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Delete Project
async function deleteProject(projectId) {
    const query = `
        DELETE FROM annotation_projects 
        WHERE id = $1
        RETURNING *;
    `;
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Check if project exists
async function exists(projectId) {
    const query = `
        SELECT 1 FROM annotation_projects WHERE id = $1;
    `;
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

module.exports = {
  create,
  findAll,
  findByAnnotator,
  findByCreator,
  findById,
  isAnnotatorAssigned,
  addImages,
  removeImages,
  getProjectImages,
  getProjectAnnotators,
  assignAnnotators,
  removeAnnotators,
  update,
  deleteProject,
  exists
};



/*
    Amjed: I double-checked the queries and the repo : 13-Nov-25
 */

// Add those to their repos and call them in the PM service 


    // Get available annotators (users with annotator role)
    // async getAvailableAnnotators() {
    //     const result = await query(`
    //         SELECT id, username, email, first_name, last_name
    //         FROM users 
    //         WHERE role_id = 3  -- annotator role_id
    //         ORDER BY username;
    //     `);
    //     return result.rows;
    // }

    // // Get available images (not assigned to any project or available for assignment)
    // async getAvailableImages() {
    //     const result = await query(`
    //         SELECT i.* 
    //         FROM images i
    //         LEFT JOIN project_images pi ON i.id = pi.image_id
    //         WHERE pi.image_id IS NULL  -- Images not assigned to any project
    //         ORDER BY i.uploaded_at DESC;
    //     `);
    //     return result.rows;
    // }