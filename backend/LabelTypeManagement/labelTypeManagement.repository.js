const pool = require('../config/db');
    
// List All Label Types
async function findAll() {
  const query = `
    SELECT lt.*,
    COUNT(lc.id) as class_count
    FROM label_types lt
    LEFT JOIN label_classes lc ON lt.id = lc.label_type_id
    GROUP BY lt.id
    ORDER BY lt.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

// Find Label Type by ID with Classes
async function findById(labelTypeId) {
  const query = `
    SELECT lt.*, 
    COUNT(lc.id) as class_count
    FROM label_types lt
    LEFT JOIN label_classes lc ON lt.id = lc.label_type_id
    WHERE lt.id = $1
    GROUP BY lt.id;
  `;
  const values = [labelTypeId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Create Label Type
async function create(labelTypeData) {
    const { name, description } = labelTypeData;
    const query = `
    INSERT INTO label_types (name, description)
    VALUES ($1, $2)
    RETURNING *;
    `;
    console.log(name+' and '+description);
    const values = [ name, description ];
    const result = await pool.query(query, values);
    
    return result.rows[0];
}

// Update Label Type
async function update(labelTypeId, labelTypeData) {
    const { name, description } = labelTypeData;
    const query = `
        UPDATE label_types 
        SET name = $1, description = $2
        WHERE id = $3
        RETURNING *;
    `;
    const values = [name, description, labelTypeId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Delete Label Types
async function deleteByIds(ids) {
    const query = `
        DELETE FROM label_types 
        WHERE id = ANY($1::int[])
        RETURNING *;
    `;
    const values = [ids];
    const result = await pool.query(query, values);
    return result.rows;
}

// Label Class Methods
async function findClassesByLabelTypeId(labelTypeId) {
    const query = `
        SELECT * FROM label_classes 
        WHERE label_type_id = $1 
        ORDER BY name;
    `;
    const values = [labelTypeId];
    const result = await pool.query(query, values);
    return result.rows;
}

async function addClass(labelTypeId, className) {
    const query = `
        INSERT INTO label_classes (label_type_id, name)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values =  [labelTypeId, className];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function removeClass(labelTypeId, classId) {
    const query = `
        DELETE FROM label_classes 
        WHERE id = $1 AND label_type_id = $2
        RETURNING *;
    `;
    const values =  [classId, labelTypeId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Check if label type exists
async function exists(labelTypeId) {
    const query = `
        SELECT 1 FROM label_types WHERE id = $1;
    `;
    const values = [labelTypeId];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

// Check if name already exists (for validation)
async function nameExists(name, excludeId = null) {
    let query = 'SELECT 1 FROM label_types WHERE name = $1';
    const values = [name];
    
    if (excludeId) {
        query += ' AND id != $2';
        values.push(excludeId);
    }
    
    const result = await pool.query(query, values);
    return result.rows.length > 0;
}

module.exports = { 
    findAll,
    findById,
    create,
    update,
    deleteByIds,
    findClassesByLabelTypeId,
    addClass,
    removeClass, 
    exists,
    nameExists 
};


/*
    Amjed: I double-checked the queries and the repo : 13-Nov-25
 */





// /*
//  List All Label Types
//     Endpoint: GET /label-types Authentication: Data Specialist
//  */


// async function ListAllLabelTypes() {
//   const query = `
//     SELECT * FROM label_types;
//   `;
//   const result = await pool.query(query);
//   return result.rows;
// }

// /*
// Get Label Type Details
//     Endpoint: GET /label-types/:id
//     Authentication: Data Specialist
//  */

// async function GetLabelTypeDetails(labelTypeId) {
//   const query = `
//     SELECT * FROM label_types p 
//     WHERE id = $1;
//   `;
//   const values = [labelTypeId];
//   const result = await pool.query(query, values);
//   return result.rows;
// }


// /*
// Create Label Type
//     Endpoint: POST /label-types
//     Authentication: Data Specialist
//     Payload:
//     {
//         "name": "Dog Breed",
//         "description": "Classification of dog breeds"
//     }
//  */
// async function CreateLabelType(labelName,LabelDescription) {
//   const query = `
//     INSERT INTO label_types (name, description)
//     VALUES ($1, $2)
//     RETURNING *;
//   `;
//   const values = [labelName,LabelDescription];
//   const result = await pool.query(query, values);
//   return result.rows;
// }

// /*
// Update Label Type
//     Endpoint: PATCH /label-types/:id
//     Authentication: Data Specialist
//     Payload:
//     {
//         "name": "Updated name",
//         "description": "Updated label type description"
//     }
//  */


// /*
// Delete Label Types
//     Endpoint: DELETE /label-types
//     Authentication: Data Specialist
//     Payload:
//     {
//         "ids": [1, 2]
//     }
//  */


// /*
// Add Class to Label Type
//     Endpoint: POST /label-types/:id/classes
//     Authentication: Data Specialist
//     Payload:
//     {
//     "name": "Husky"
//     }
//  */

// /*
// Remove Class from Label Type
//     Endpoint: DELETE /label-types/:id/classes/:classID
//     Authentication: Data Specialist
//     Payload: None
//  */


// async function LabelRepoTest() {
//   return json({ message: 'This is Label Type Repository -- connected' });
// }

// module.exports = { LabelRepoTest};



// // async function getAnnotatorProjects(annotatorId) {
// //   const query = `
// //     SELECT p.* FROM annotation_projects p 
// //     INNER JOIN project_assignments pa ON p.id = pa.project_id 
// //     WHERE pa.annotator_id = $1;
// //   `;
// //   const values = [annotatorId];
// //   const result = await pool.query(query, values);
// //   return result.rows;
// // }

// // async function getProjectById(projectId, annotatorId) {
// //   const query = `
// //     SELECT p.* FROM annotation_projects p 
// //     INNER JOIN project_assignments pa ON p.id = pa.project_id 
// //     WHERE pa.annotator_id = $1 AND p.id = $2;
// //   `;
// //   const result = await pool.query(query, [annotatorId,projectId]);

// //   return result.rows[0] || null;
// // }
// // module.exports = { getAnnotatorProjects, getProjectById };


