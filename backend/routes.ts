import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAuthRoutes } from "./src/auth/routes";
import { registerProjectRoutes } from "./src/projects/routes";
import { registerAnnotationRoutes } from "./src/annotations/routes";

export async function registerRoutes(app: Express): Promise<Server> {
  registerAuthRoutes(app);
  registerProjectRoutes(app);
  registerAnnotationRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}