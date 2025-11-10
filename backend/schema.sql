CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) ,
    last_name VARCHAR(255) ,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    s3_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE label_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE label_classes (
    id SERIAL PRIMARY KEY,
    label_type_id INTEGER REFERENCES label_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE annotation_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    label_type_id INTEGER REFERENCES label_types(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE annotations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES annotation_projects(id) ON DELETE CASCADE,
    image_id INTEGER REFERENCES images(id),
    annotator_id INTEGER REFERENCES users(id),
    label_class_id INTEGER REFERENCES label_classes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_assignments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES annotation_projects(id) ON DELETE CASCADE,
    annotator_id INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, annotator_id)
);


CREATE TABLE project_images(
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES annotation_projects(id) ON DELETE CASCADE,
    image_id INTEGER REFERENCES images(id)
);

-- inserting the roles to be available when creating new accounts == similar to have enum Roles
-- === ROLES ===
INSERT INTO roles (name) VALUES 
('admin'),
('data specialist'),
('annotator'),
('ml engineer'),

ON CONFLICT DO NOTHING;