-- === ROLES ===
INSERT INTO roles (name) VALUES 
('admin'),
('data specialist'),
('annotator'),
('ml engineer'),

ON CONFLICT DO NOTHING;

-- === USERS ===
-- Admin (creates projects)
-- (The password hash = bcrypt hash of "password")

-- === LABEL TYPES ===
INSERT INTO label_types (name) VALUES 
('Dog Breed'),
('Car Brand')
ON CONFLICT DO NOTHING;

-- === LABEL CLASSES ===
-- Dog Breed Classes
INSERT INTO label_classes (name, label_type_id) VALUES 
('Labrador Retriever', 1),
('German Shepherd', 1),
('Golden Retriever', 1),
('Bulldog', 1),
('Beagle', 1)
ON CONFLICT DO NOTHING;

-- Car Brand Classes
INSERT INTO label_classes (name, label_type_id) VALUES 
('Toyota', 2),
('Honda', 2),
('BMW', 2),
('Mercedes-Benz', 2),
('Audi', 2)
ON CONFLICT DO NOTHING;

-- === IMAGES ===
INSERT INTO images (filename, s3_url) VALUES 
('dog_image_1.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ2KTIAT_DenX2WjbncE_RLRciOTySwEnxaQ&s'),
('dog_image_2.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu24VGO83eZhYo6wozTsPVZlPvvO58_CcVcg&s'),
('dog_image_3.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfk69QTQSohwHKpzns24CeyHQ5S4Hb5BbHxA&s'),
('car_image_1.jpg', 'https://www.dennemeyer.com/fileadmin/a/blog/Everyday_IP_Italian_cars/Everyday-IP-The-iconic-elegance-of-Italian-cars.03.jpg'),
('car_image_2.jpg', 'https://www.goodwood.com/globalassets/.road--racing/road/news/2025/05-may/best-italian-cars-to-buy/ferrari-12cilindri.jpg?rxy=0.5,0.5')
ON CONFLICT DO NOTHING;

-- === PROJECTS ===
INSERT INTO annotation_projects (name, description, created_by, label_type_id) VALUES
('Dog Breed Classification', 'Annotate dog images by breed', 2, 1),
('Car Brand Detection', 'Annotate car images by brand', 2, 2)
ON CONFLICT DO NOTHING;

-- === PROJECT IMAGES ===
-- Assign dog images to Project 1
INSERT INTO project_images (project_id, image_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- Assign car images to Project 2
INSERT INTO project_images (project_id, image_id) VALUES
(2, 4),
(2, 5);

-- === PROJECT ASSIGNMENTS ===
-- Assign annotator1 to both projects
INSERT INTO project_assignments (project_id, annotator_id) VALUES
(1, 2),
(2, 2)
ON CONFLICT DO NOTHING;


-- === DONE ===
SELECT 'Seed data inserted successfully!' AS status;
