import type { Express } from "express";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";

// Middleware to verify admin access
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    // Attach user to request for use in route handlers
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export function registerAdminRoutes(app: Express) {
  /**
   * @swagger
   * /api/admin/users:
   *   get:
   *     summary: Get all users (admin only)
   *     tags: [Admin]
   *     responses:
   *       200:
   *         description: List of all users
   *       401:
   *         description: Not authenticated
   *       403:
   *         description: Access denied
   */
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });

  /**
   * @swagger
   * /api/admin/users/{id}/role:
   *   put:
   *     summary: Update user role (admin only)
   *     tags: [Admin]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [annotator, data_specialist, admin]
   *     responses:
   *       200:
   *         description: Role updated successfully
   *       400:
   *         description: Invalid role
   *       401:
   *         description: Not authenticated
   *       403:
   *         description: Access denied
   *       404:
   *         description: User not found
   */
  app.put("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userIdToUpdate = req.params.id;
      const { role } = req.body;

      // Validate role
      const validRoles = ['annotator', 'data_specialist', 'admin'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ 
          error: "Invalid role. Must be one of: annotator, data_specialist, admin" 
        });
      }

      // Check if user exists
      const userToUpdate = await storage.getUser(userIdToUpdate);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update the role
      await storage.updateUserRole(userIdToUpdate, role);

      res.json({ 
        message: "User role updated successfully",
        userId: userIdToUpdate,
        newRole: role
      });
    } catch (error: any) {
      console.error("Update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  /**
   * @swagger
   * /api/admin/users:
   *   post:
   *     summary: Create a new user (admin only)
   *     tags: [Admin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InsertUser'
   *     responses:
   *       200:
   *         description: User created successfully
   *       400:
   *         description: Bad request or user already exists
   *       401:
   *         description: Not authenticated
   *       403:
   *         description: Access denied
   */
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "User with this email already exists" 
        });
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
      
      res.json({
        message: "User created successfully",
        user: userWithoutPassword
      });
    } catch (error: any) {
      console.error("Create user error:", error);
      res.status(400).json({ 
        error: error.message || "Failed to create user" 
      });
    }
  });
}