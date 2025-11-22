import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertProjectSchema, insertLabelSchema, insertImageSchema, insertProjectImagesSchema, insertAnnotationSchema, insertLabelClassSchema, insertProjectImageSchema } from "@shared/schema";
import multer from 'multer';
import { uploadFile, deleteFile, initializeMinio } from './services/minio';
import { extractImagesFromZip } from './services/zip';

import jwt from "jsonwebtoken";

import { authenticateToken, requireRole } from "./middlewares/authorize";
import { validate } from "./middlewares/validation";
// Create partial schemas for updates
const updateLabelSchema = insertLabelSchema.partial();

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
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InsertUser'
   *     responses:
   *       200:
   *         description: The user was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: The user was successfully logged in
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
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

      
      // Generate JWT token
      const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;
      res.json({user: userWithoutPassword, token});
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout a user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: The user was successfully logged out
   *       500:
   *         description: Server error
   */
  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get the current user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: The current user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   */
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
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all annotators
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: A list of annotators
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
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
  /**
   * @swagger
   * /api/projects:
   *   post:
   *     summary: Create a new project
   *     tags: [Projects]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InsertProject'
   *     responses:
   *       200:
   *         description: The project was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Project'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @swagger
   * /api/projects:
   *   get:
   *     summary: Get all projects for the current user
   *     tags: [Projects]
   *     responses:
   *       200:
   *         description: A list of projects
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Project'
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @swagger
   * /api/projects/{id}:
   *   get:
   *     summary: Get a project by ID
   *     tags: [Projects]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     responses:
   *       200:
   *         description: The project
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Project'
   *       404:
   *         description: Project not found
   */
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

  /**
 * @swagger
 * /api/projects/{id}/images:
 *   post:
 *     summary: Assign images to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertProjectImages'
 *     responses:
 *       201:
 *         description: Images assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */

  app.post("/api/projects/:id/images", authenticateToken, requireRole(["data_specialist"]), async (req,res) => {
    try {
      const projectId = req.params.id;
      const { imageIds } = req.body;

      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found"
        });
      }

      console.log(project)
      console.log(req.session.userId)
      console.log((req as any).user)
      console.log(imageIds)
      // Verify user has access to this project
      const userId = (req as any).user.id;
      // Data specialists can only assign to their own projects
      if (project.createdBy !== userId) {
        return res.status(403).json({
          success: false,
          error: "You can only assign images to your own projects"
        });
      }

      // Assign images to project
      const assignedImages = await storage.assignImagesToProject(projectId, imageIds);

      res.status(201).json({
        success: true,
        data: assignedImages,
        message: `Successfully assigned ${assignedImages.length} images to project`
      });
    } catch (error: any) {
      console.error("Assign images error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to assign images to project"
      });
    }
  });


  // Project assignment routes
  /**
   * @swagger
   * /api/projects/{projectId}/assign:
   *   post:
   *     summary: Assign a user to a project
   *     tags: [Projects]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: The user was successfully assigned to the project
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @swagger
   * /api/projects/{projectId}/assignments:
   *   get:
   *     summary: Get all assignments for a project
   *     tags: [Projects]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     responses:
   *       200:
   *         description: A list of assignments
   *       401:
   *         description: Unauthorized
   */
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

  // Image routes
  /**
   * @swagger
   * /api/projects/{projectId}/images/upload:
   *   post:
   *     summary: Upload images or a ZIP file of images to a project
   *     tags: [Images]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: The images were successfully uploaded
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  // Universal upload endpoint (images + ZIP) - SINGLE ENDPOINT FOR ALL UPLOADS
  app.post("/api/images/upload",
      uploadUniversal.array('images', 50),
      async (req, res) => {
        try {
          console.log('Headers:', req.headers);
          console.log('Content-Type:', req.headers['content-type']);
          console.log('Files received:', req.files);
          
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
                      // projectId: req.params.projectId,
                      filename: extractedFile.filename,
                      url: url,
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
                console.log(file.originalname)
                console.log(url)
                const image = await storage.createImage({
                  // projectId: req.params.projectId,
                  filename: file.originalname,
                  url: url,
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

  /**
   * @swagger
   * /api/projects/{projectId}/images:
   *   get:
   *     summary: Get all images for a project
   *     tags: [Images]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     responses:
   *       200:
   *         description: A list of images
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Image'
   */
  app.get("/api/projects/:projectId/images", async (req, res) => {
    try {
      const images = await storage.getImagesByProject(req.params.projectId);     
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  /**
   * @swagger
   * /api/portfolio/images:
   *   get:
   *     summary: Get all images across all projects for the current data specialist
   *     tags: [Portfolio]
   *     security:
   *       - sessionAuth: []
   *     parameters:
   *       - in: query
   *         name: projectId
   *         schema:
   *           type: string
   *         description: Filter by specific project ID (optional)
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [uploadedAt, projectName]
   *         description: "Sort by field (default: uploadedAt)"
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: "Sort order (default: desc)"
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: "Pagination limit (default: 50)"
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *         description: "Pagination offset (default: 0)"
   *     responses:
   *       200:
   *         description: Portfolio images with statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 images:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PortfolioImage'
   *                 total:
   *                   type: integer
   *                 stats:
   *                   $ref: '#/components/schemas/PortfolioStats'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Access denied (data specialist only)
   */
  app.get("/api/portfolio/images", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      // if (!user || user.role !== 'data_specialist') {
      //   return res.status(403).json({ error: "Access denied" });
      // }

      const { projectId, sortBy, sortOrder, limit, offset } = req.query;

      const result = await storage.getPortfolioImages(userId, {
        projectId: projectId as string,
        sortBy: sortBy as 'uploadedAt' | 'projectName',
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      // const result = {};
      res.json(result);
    } catch (error: any) {
      console.error("Get portfolio images error:", error);
      res.status(500).json({ error: "Failed to get portfolio images" });
    }
  });
  
  /**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images (Data Specialist only)
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Image'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
  app.get("/api/images", authenticateToken, requireRole(["data_specialist"]),async (req, res) => {
    try {
      const images = await storage.getAllImages();     
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  /**
   * @swagger
   * /api/images/{id}:
   *   delete:
   *     summary: Delete an image by ID
   *     tags: [Images]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The image ID
   *     responses:
   *       200:
   *         description: The image was successfully deleted
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Image not found
   *       500:
   *         description: Server error
   */
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

  // Label routes
  /**
   * @swagger
   * /api/projects/{projectId}/labels:
   *   post:
   *     summary: Create a new label for a project
   *     tags: [Labels]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InsertLabel'
   *     responses:
   *       200:
   *         description: The label was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Label'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  // app.post("/api/projects/:projectId/labels", async (req, res) => {
  //   try {
  //     const userId = req.session?.userId;
  //     if (!userId) {
  //       return res.status(401).json({ error: "Not authenticated" });
  //     }

  //     const data = insertLabelSchema.parse({
  //       projectId: req.params.projectId,
  //       name: req.body.name,
  //     });

  //     const label = await storage.createLabel(data);
  //     res.json(label);
  //   } catch (error: any) {
  //     console.error("Create label error:", error);
  //     res.status(400).json({ error: error.message || "Failed to create label" });
  //   }
  // });

  /**
   * @swagger
   * /api/projects/{projectId}/labels:
   *   get:
   *     summary: Get all labels for a project
   *     tags: [Labels]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         schema:
   *           type: string
   *         required: true
   *         description: The project ID
   *     responses:
   *       200:
   *         description: A list of labels
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Label'
   */
  // app.get("/api/projects/:projectId/labels", async (req, res) => {
  //   try {
  //     const labels = await storage.getLabelsByProject(req.params.projectId);
  //     res.json(labels);
  //   } catch (error: any) {
  //     console.error("Get labels error:", error);
  //     res.status(500).json({ error: "Failed to get labels" });
  //   }
  // });

  /**
   * @swagger
   * /api/labels/{id}:
   *   delete:
   *     summary: Delete a label by ID
   *     tags: [Labels]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The label ID
   *     responses:
   *       200:
   *         description: The label was successfully deleted
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
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


  /**
 * @swagger
 * /api/label-types:
 *   get:
 *     summary: Get all label types
 *     tags: [Label Types]
 *     responses:
 *       200:
 *         description: List of all label types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Label'
 *       500:
 *         description: Server error
 */
  app.get('/api/label-types/', async (req,res) => {
    try {
      const labels = await storage.getAllLabelTypes();
      
      if(!labels){
        res.status(404).json({
          sucess: false,
          error: 'Failed to retrieve label types'
        })
      }

      res.json({
          success: true,
          data: labels
      });

    } catch (error: any) {
      console.error('Error listing label types:', error);
        res.status(500).json({
          success: false,
          error: 'Error listing label types'
        });
    }
  });
  /**
 * @swagger
 * /api/label-types/{id}:
 *   get:
 *     summary: Get a specific label type by ID
 *     tags: [Label Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label type ID
 *     responses:
 *       200:
 *         description: Label type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.get('/api/label-types/:id', authenticateToken, async (req,res) =>{
    try {
        const { id } = req.params;
        const labelType = await storage.getLabelType(id);
        
        if (!labelType) {
          res.status(404).json({
          success: false,
          error: 'Label type not found'
        });
        }

        res.status(200).json({
            success: true,
            data: labelType
        });
    } catch (error: any) {
        console.error('Error fetching label type details:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching label type details' 
        });
    }
  });
  /**
 * @swagger
 * /api/label-types:
 *   post:
 *     summary: Create a new label type (Data Specialist only)
 *     tags: [Label Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertLabel'
 *     responses:
 *       201:
 *         description: Label type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
  app.post('/api/label-types', authenticateToken, requireRole(['data_specialist']), validate(insertLabelSchema) , async (req,res) =>{
    try {
      const { name, description } = req.body;

      const newLabel = await storage.createLabel({ name, description });
      
      res.status(201).json({
        sucess: true,
        data: newLabel,
        message: 'Label type created successfully'
      });

    } catch (error) {
      console.error('Error creating label:', error);
      res.status(500).json({
          success: false,
          error: 'Error creating new label '
      });
    }
  });
  /**
 * @swagger
 * /api/label-types/{id}:
 *   patch:
 *     summary: Update a label type (Data Specialist only)
 *     tags: [Label Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertLabel'
 *     responses:
 *       200:
 *         description: Label type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
  app.patch('/api/label-types/:id', authenticateToken, requireRole(['data_specialist']), validate(updateLabelSchema) , async (req,res) =>{
     try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const updatedLabel = await storage.updateLabelType(id, { name, description });
      
      res.json({
          success: true,
          data: updatedLabel,
          message: 'Label type updated successfully'
      });
    } catch (error) {
      console.error('Error updating label type:', error);
      res.status(500).json({
          success: false,
          error: 'Error updating label type'
      });
    }
  });
  /**
 * @swagger
 * /api/label-types:
 *   delete:
 *     summary: Delete multiple label types (Data Specialist only)
 *     tags: [Label Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *     responses:
 *       204:
 *         description: Label types deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
  app.delete('/api/label-types', authenticateToken, requireRole(['data_specialist']), async (req, res)=>{
    try {
      const { ids } = req.body;
      console.log(ids)

    if (!Array.isArray(ids)) {
      return res.status(400).json({ 
        success: false, 
        error: "IDs must be provided as an array" 
      });
    }

      const deletedLabels = await storage.deleteLabelTypes(ids);
      res.status(204).json({
            success: true,
            data: deletedLabels,
            message: `Successfully deleted  ${deletedLabels.length} label type(s)`
        });
    } catch (error: any) {
      console.error("Delete label error:", error);
      res.status(500).json({ error: "Failed to delete label" });
    }
  });
  // app Label Class Management

  /**
 * @swagger
 * /api/label-types/{id}/classes:
 *   get:
 *     summary: Get classes for a label type (Data Specialist only)
 *     tags: [Label Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label type ID
 *     responses:
 *       200:
 *         description: List of label classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabelClass'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.get('/api/label-types/:id/classes', authenticateToken, requireRole(['data_specialist']), async (req,res) =>{
    try {
      const { id } = req.params;
      
      const typeClass = await storage.getLabelClassesByType(id);
      
      if(!typeClass){
        res.status(404).json({
          scucess: false,
          error: 'Class not Found'
        });
      }

      res.status(201).json({
        sucess: true,
        data: typeClass,
      });

    } catch (error) {
      console.error('Error fetching class:', error);
      res.status(500).json({
          success: false,
          error: 'Error fetching class '
      });
    }
  });
  /**
 * @swagger
 * /api/label-types/{id}/classes:
 *   post:
 *     summary: Add a class to a label type (Data Specialist only)
 *     tags: [Label Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsertLabelClass'
 *     responses:
 *       201:
 *         description: Class added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
  app.post('/api/label-types/:id/classes', authenticateToken, requireRole(['data_specialist']), validate(insertLabelClassSchema, {mergeData: (req) => ({ labelTypeId: req.params.id })}), 
   async (req,res) =>{
    try {
      const newClass = await storage.addLabelClass(req.body);
      
      res.status(201).json({
        sucess: true,
        data: newClass,
        message: 'class added successfully'
      });

    } catch (error) {
      console.error('Error adding class:', error);
      res.status(500).json({
          success: false,
          error: 'Error adding new class '
      });
    }
  });
  /**
 * @swagger
 * /api/label-types/{id}/classes/{classId}:
 *   delete:
 *     summary: Remove a class from a label type (Data Specialist only)
 *     tags: [Label Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label type ID
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Label class ID
 *     responses:
 *       200:
 *         description: Class removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.delete('/api/label-types/:id/classes/:classId', authenticateToken, requireRole(['data_specialist']), async (req,res) =>{
    try {
      const { id, classId } = req.params;

      const deletedClass = await storage.removeLabelClass(id, classId);

      res.status(201).json({
        sucess: true,
        data: deletedClass,
        message: 'class removed successfully'
      });

    } catch (error) {
      console.error('Error removing class:', error);
      res.status(500).json({
          success: false,
          error: 'Error removing new class '
      });
    }
  });



  // Annotation Management

  // Annotation routes
  /**
   * @swagger
   * /api/annotations:
   *   post:
   *     summary: Create a new annotation
   *     tags: [Annotations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InsertAnnotation'
   *     responses:
   *       200:
   *         description: The annotation was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Annotation'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @swagger
   * /api/images/{imageId}/annotations:
   *   get:
   *     summary: Get all annotations for an image
   *     tags: [Annotations]
   *     parameters:
   *       - in: path
   *         name: imageId
   *         schema:
   *           type: string
   *         required: true
   *         description: The image ID
   *     responses:
   *       200:
   *         description: A list of annotations
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Annotation'
   */
  app.get("/api/images/:imageId/annotations", async (req, res) => {
    try {
      const annotations = await storage.getAnnotationsByImage(req.params.imageId);
      res.json(annotations);
    } catch (error: any) {
      console.error("Get annotations error:", error);
      res.status(500).json({ error: "Failed to get annotations" });
    }
  });


  // app.post('/api/annotation', authenticateToken, requireRole(['annotator']),validate(insertAnnotationSchema, { mergeData: (req) => ({ projectId: req.session.userId }) }), async (req,res) => {
  //   try {

  //       const newAnnotation = await storage.createAnnotation(req.body);
        
  //       res.status(201).json({
  //         sucess: true,
  //         data: newAnnotation,
  //         message: 'Annotation saved successfully'
  //       });

  //     } catch (error) {
  //       console.error('Error saving Annotation:', error);
  //       res.status(500).json({
  //           success: false,
  //           error: 'Error saving annotation'
  //       });
  //     }
  // });
  /**
 * @swagger
 * /api/annotation/project/{projectId}:
 *   get:
 *     summary: Get annotations for a project (Annotator only)
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of annotations for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annotation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.get('/api/annotation/project/:projectId', authenticateToken, requireRole(['annotator']), async (req,res) => {
    try {
          const { id } = req.params;
          const annotations = await storage.getAnnotationsByProject(id);
          
          if (!annotations) {
            res.status(404).json({
            success: false,
            error: 'Project not found'
          });
          }

          res.status(200).json({
              success: true,
              data: annotations
          });
      } catch (error: any) {
          console.error('Error fetching annotations for the project', error);
          res.status(500).json({
              success: false,
              error: 'Error fetching annotations for the project' 
          });
      }
  });

  /**
 * @swagger
 * /api/annotation/{id}:
 *   get:
 *     summary: Get a specific annotation (Annotator only)
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Annotation ID
 *     responses:
 *       200:
 *         description: Annotation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annotation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.get('/api/annotation/:id', authenticateToken, requireRole(['annotator']), async (req,res) => {
    try {
          const { id } = req.params;
          const annotation = await storage.getAnnotation(id);
          
          if (!annotation) {
            res.status(404).json({
            success: false,
            error: 'annotation not found'
          });
          }

          res.status(200).json({
              success: true,
              data: annotation
          });
      } catch (error: any) {
          console.error('Error fetching annotation', error);
          res.status(500).json({
              success: false,
              error: 'Error fetching annotation' 
          });
      }
  });

  /**
 * @swagger
 * /api/annotation/{id}:
 *   delete:
 *     summary: Delete an annotation (Annotator only)
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Annotation ID
 *     responses:
 *       200:
 *         description: Annotation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
  app.delete('/api/annotation/:id', authenticateToken, requireRole(['annotator']), async (req,res) => {
    try {
        const { id } = req.params;

        const deletedAnnotation = await storage.deleteAnnotation(id);

        res.status(201).json({
          sucess: true,
          data: deletedAnnotation,
          message: 'annotation deleted successfully'
        });

      } catch (error) {
        console.error('Error deleting annotation:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting annotation '
        });
      }
  });

// Statistics

/**
 * @swagger
 * /api/annotation/project/{projectId}/stats:
 *   get:
 *     summary: Get annotation statistics for a project (Data Specialist only)
 *     tags: [Annotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Annotation statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAnnotations:
 *                   type: integer
 *                 completedImages:
 *                   type: integer
 *                 totalImages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
app.get('/api/annotation/project/:projectId/stats', authenticateToken, requireRole(['data_specialist']), async (req,res)=>{
  try {
      const { projectId } = req.params;

      const stats = await storage.getProjectStats(projectId);

      res.status(201).json({
        sucess: true,
        data: stats,
      });

    } catch (error) {
      console.error('Error fetching annotation statistics', error);
      res.status(500).json({
          success: false,
          error: 'Error fetching annotation statistics'
      });
    }
});

  const httpServer = createServer(app);
  return httpServer;
}