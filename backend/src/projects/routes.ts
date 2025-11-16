import type { Express } from "express";
import multer from "multer";
import { insertProjectSchema, insertLabelSchema } from "@shared/schema";
import { storage } from "../../storage";

export function registerProjectRoutes(app: Express) {
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

  app.get("/api/projects/:projectId/images", async (req, res) => {
    try {
      const images = await storage.getImagesByProject(req.params.projectId);
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getAllImages();
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });

  const upload = multer({ dest: "uploads/" });
  app.post("/api/projects/:projectId/images", upload.array("images"), async (req, res) => {
    try {
      const files = req.files;
      const projectId = req.params.projectId;

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      for (const file of files) {
        await storage.createImage({
          projectId,
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          size: file.size,
        });
      }

      res.json({ message: "Files uploaded successfully" });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

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
}