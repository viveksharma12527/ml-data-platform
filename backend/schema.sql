CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
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
('ml engineer')

ON CONFLICT DO NOTHING;

-- inserting images since the component not ready yet 
-- === IMAGES ===
INSERT INTO images (filename, s3_url) VALUES 
('dog_image_1.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ2KTIAT_DenX2WjbncE_RLRciOTySwEnxaQ&s'),
('dog_image_2.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu24VGO83eZhYo6wozTsPVZlPvvO58_CcVcg&s'),
('dog_image_3.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfk69QTQSohwHKpzns24CeyHQ5S4Hb5BbHxA&s'),
('car_image_4.jpg', 'https://www.dennemeyer.com/fileadmin/a/blog/Everyday_IP_Italian_cars/Everyday-IP-The-iconic-elegance-of-Italian-cars.03.jpg'),
('car_image_5.jpg', 'https://www.goodwood.com/globalassets/.road--racing/road/news/2025/05-may/best-italian-cars-to-buy/ferrari-12cilindri.jpg?rxy=0.5,0.5'),
('dog_image_6.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ2KTIAT_DenX2WjbncE_RLRciOTySwEnxaQ&s'),
('dog_image_7.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu24VGO83eZhYo6wozTsPVZlPvvO58_CcVcg&s'),
('dog_image_8.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfk69QTQSohwHKpzns24CeyHQ5S4Hb5BbHxA&s'),
('car_image_9.jpg', 'https://www.dennemeyer.com/fileadmin/a/blog/Everyday_IP_Italian_cars/Everyday-IP-The-iconic-elegance-of-Italian-cars.03.jpg'),
('car_image_10.jpg', 'https://www.goodwood.com/globalassets/.road--racing/road/news/2025/05-may/best-italian-cars-to-buy/ferrari-12cilindri.jpg?rxy=0.5,0.5'),
('dog_image_11.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ2KTIAT_DenX2WjbncE_RLRciOTySwEnxaQ&s'),
('dog_image_12.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu24VGO83eZhYo6wozTsPVZlPvvO58_CcVcg&s'),
('dog_image_13.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfk69QTQSohwHKpzns24CeyHQ5S4Hb5BbHxA&s'),
('car_image_14.jpg', 'https://www.dennemeyer.com/fileadmin/a/blog/Everyday_IP_Italian_cars/Everyday-IP-The-iconic-elegance-of-Italian-cars.03.jpg'),
('car_image_15.jpg', 'https://www.goodwood.com/globalassets/.road--racing/road/news/2025/05-may/best-italian-cars-to-buy/ferrari-12cilindri.jpg?rxy=0.5,0.5'),
('dog_image_16.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ2KTIAT_DenX2WjbncE_RLRciOTySwEnxaQ&s'),
('dog_image_17.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu24VGO83eZhYo6wozTsPVZlPvvO58_CcVcg&s'),
('dog_image_18.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfk69QTQSohwHKpzns24CeyHQ5S4Hb5BbHxA&s'),
('car_image_19.jpg', 'https://www.dennemeyer.com/fileadmin/a/blog/Everyday_IP_Italian_cars/Everyday-IP-The-iconic-elegance-of-Italian-cars.03.jpg'),
('car_image_20.jpg', 'https://www.goodwood.com/globalassets/.road--racing/road/news/2025/05-may/best-italian-cars-to-buy/ferrari-12cilindri.jpg?rxy=0.5,0.5')

ON CONFLICT DO NOTHING;
