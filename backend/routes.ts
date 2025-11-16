import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertProjectSchema, insertLabelSchema, insertImageSchema, insertAnnotationSchema } from "@shared/schema";
import multer from 'multer';
import { uploadFile, deleteFile, initializeMinio } from './services/minio';
import { extractImagesFromZip } from './services/zip';

// Configure multer for universal upload (images + ZIP)
const uploadUniversal = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1GB limit (for ZIP files)
  },
  fileFilter: (req, file, cb) => {
    // Accept images and ZIP files
    const isImage = file.mimetype.startsWith('image/');
    const isZip = file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.toLowerCase().endsWith('.zip');

    if (!isImage && !isZip) {
      cb(new Error('Only image and ZIP files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MinIO on startup
  try {
    await initializeMinio();
    console.log('MinIO initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MinIO:', error);
  }

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session
      if (req.session) {
        req.session.userId = user.id;
      }

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== 'data_specialist') {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get all users
      const users = await storage.getAllUsers();

      // Filter to only return annotators and remove passwords
      const annotators = users
          .filter(u => u.role === 'annotator')
          .map(({ password, ...user }) => user);

      res.json(annotators);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Project routes (Data Specialist)
  app.post("/api/projects", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const data = insertProjectSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const project = await storage.createProject(data);
      res.json(project);
    } catch (error: any) {
      console.error("Create project error:", error);
      res.status(400).json({ error: error.message || "Failed to create project" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let projects;
      if (user.role === "data_specialist") {
        projects = await storage.getProjectsByCreator(userId);
      } else {
        projects = await storage.getProjectsByAnnotator(userId);
      }

      res.json(projects);
    } catch (error: any) {
      console.error("Get projects error:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Get project error:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  // Label routes
  app.post("/api/projects/:projectId/labels", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const data = insertLabelSchema.parse({
        projectId: req.params.projectId,
        name: req.body.name,
      });

      const label = await storage.createLabel(data);
      res.json(label);
    } catch (error: any) {
      console.error("Create label error:", error);
      res.status(400).json({ error: error.message || "Failed to create label" });
    }
  });

  app.get("/api/projects/:projectId/labels", async (req, res) => {
    try {
      const labels = await storage.getLabelsByProject(req.params.projectId);
      res.json(labels);
    } catch (error: any) {
      console.error("Get labels error:", error);
      res.status(500).json({ error: "Failed to get labels" });
    }
  });

  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      await storage.deleteLabel(req.params.id);
      res.json({ message: "Label deleted successfully" });
    } catch (error: any) {
      console.error("Delete label error:", error);
      res.status(500).json({ error: "Failed to delete label" });
    }
  });

  // Image routes
  // Universal upload endpoint (images + ZIP) - SINGLE ENDPOINT FOR ALL UPLOADS
  app.post("/api/projects/:projectId/images/upload",
      uploadUniversal.array('images', 50),
      async (req, res) => {
        try {
          const userId = req.session?.userId;
          if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
          }

          const files = req.files as Express.Multer.File[];
          if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
          }

          console.log(`Processing ${files.length} file(s)`);

          const uploadedImages = [];
          const errors = [];

          // Process each file
          for (const file of files) {
            // Check if it's a ZIP file
            const isZip = file.mimetype === 'application/zip' ||
                file.mimetype === 'application/x-zip-compressed' ||
                file.originalname.toLowerCase().endsWith('.zip');

            if (isZip) {
              // Extract and upload images from ZIP
              console.log(`Extracting ZIP: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

              try {
                const extractedFiles = extractImagesFromZip(file.buffer);
                console.log(`Found ${extractedFiles.length} images in ZIP`);

                for (const extractedFile of extractedFiles) {
                  try {
                    const url = await uploadFile(
                        extractedFile.buffer,
                        extractedFile.filename,
                        extractedFile.mimetype
                    );

                    const image = await storage.createImage({
                      projectId: req.params.projectId,
                      filename: extractedFile.filename,
                      url: url,
                      size: extractedFile.buffer.length,
                    });

                    uploadedImages.push(image);
                    console.log(`Uploaded from ZIP: ${extractedFile.filename}`);
                  } catch (error: any) {
                    console.error(`Failed: ${extractedFile.filename}:`, error.message);
                    errors.push({
                      filename: extractedFile.filename,
                      error: error.message,
                    });
                  }
                }
              } catch (error: any) {
                console.error(`Failed to process ZIP ${file.originalname}:`, error.message);
                errors.push({
                  filename: file.originalname,
                  error: `ZIP extraction failed: ${error.message}`,
                });
              }
            } else {
              // Upload single image
              try {
                const url = await uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype
                );

                const image = await storage.createImage({
                  projectId: req.params.projectId,
                  filename: file.originalname,
                  url: url,
                  size: file.size,
                });

                uploadedImages.push(image);
                console.log(`Uploaded: ${file.originalname}`);
              } catch (error: any) {
                console.error(`Failed: ${file.originalname}:`, error.message);
                errors.push({
                  filename: file.originalname,
                  error: error.message,
                });
              }
            }
          }

          console.log(`Upload complete: ${uploadedImages.length} success, ${errors.length} failed`);

          res.json({
            success: uploadedImages.length,
            failed: errors.length,
            images: uploadedImages,
            errors: errors,
          });
        } catch (error: any) {
          console.error("Upload error:", error);
          res.status(500).json({ error: error.message || "Failed to upload files" });
        }
      }
  );

  app.get("/api/projects/:projectId/images", async (req, res) => {
    try {
      const images = await storage.getImagesByProject(req.params.projectId);
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  // Delete image (with MinIO cleanup)
  app.delete("/api/images/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get image to extract filename
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Extract filename from URL (MinIO URLs end with the object name)
      const urlParts = image.url.split('/');
      const filename = urlParts[urlParts.length - 1];

      if (filename) {
        try {
          await deleteFile(filename);
          console.log(`Deleted file from MinIO: ${filename}`);
        } catch (error) {
          console.warn("Could not delete file from MinIO:", error);
          // Continue anyway - delete from DB even if MinIO deletion fails
        }
      }

      // Delete from database
      await storage.deleteImage(req.params.id);

      res.json({ message: "Image deleted successfully" });
    } catch (error: any) {
      console.error("Delete image error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Annotation routes
  app.post("/api/annotations", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const data = insertAnnotationSchema.parse({
        ...req.body,
        userId,
      });

      const annotation = await storage.createAnnotation(data);
      res.json(annotation);
    } catch (error: any) {
      console.error("Create annotation error:", error);
      res.status(400).json({ error: error.message || "Failed to create annotation" });
    }
  });

  app.get("/api/images/:imageId/annotations", async (req, res) => {
    try {
      const annotations = await storage.getAnnotationsByImage(req.params.imageId);
      res.json(annotations);
    } catch (error: any) {
      console.error("Get annotations error:", error);
      res.status(500).json({ error: "Failed to get annotations" });
    }
  });

  // Project assignment routes
  app.post("/api/projects/:projectId/assign", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const assignment = await storage.assignUserToProject({
        projectId: req.params.projectId,
        userId: req.body.userId,
      });

      res.json(assignment);
    } catch (error: any) {
      console.error("Assign user error:", error);
      res.status(400).json({ error: error.message || "Failed to assign user" });
    }
  });

  app.get("/api/projects/:projectId/assignments", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const assignments = await storage.getProjectAssignments(req.params.projectId);

      // Get user details for each assignment
      const assignmentsWithUsers = await Promise.all(
          assignments.map(async (assignment) => {
            const user = await storage.getUser(assignment.userId);
            return {
              ...assignment,
              user: user ? { id: user.id, name: user.name, email: user.email } : null,
            };
          })
      );

      res.json(assignmentsWithUsers);
    } catch (error: any) {
      console.error("Get assignments error:", error);
      res.status(500).json({ error: "Failed to get assignments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}