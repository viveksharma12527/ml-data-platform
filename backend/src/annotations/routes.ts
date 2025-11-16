import type { Express } from "express";
import { insertAnnotationSchema } from "@shared/schema";
import { storage } from "../../storage";

export function registerAnnotationRoutes(app: Express) {
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
}