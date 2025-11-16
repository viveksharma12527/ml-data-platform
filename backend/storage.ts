import { db } from "./db";
import {
  users, type InsertUser, type User,
  projects, type InsertProject, type Project,
  labels, type InsertLabel, type Label,
  images, type InsertImage, type Image,
  annotations, type InsertAnnotation, type Annotation,
  projectAssignments, type InsertProjectAssignment, type ProjectAssignment
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByCreator(userId: string): Promise<Project[]>;
  getProjectsByAnnotator(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  getProjectProgress(projectId: string): Promise<{ totalImages: number, annotatedImages: number }>;
  updateProjectStatus(id: string, status: "not_started" | "in_progress" | "completed"): Promise<void>;

  // Label methods
  getLabelsByProject(projectId: string): Promise<Label[]>;
  createLabel(label: InsertLabel): Promise<Label>;
  deleteLabel(id: string): Promise<void>;

  // Image methods
  getImagesByProject(projectId: string): Promise<Image[]>;
  getImage(id: string): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: string): Promise<void>;
  getPortfolioImages(userId: string, filters?: {
    projectId?: string;
    sortBy?: 'uploadedAt' | 'projectName';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{
    images: Array<Image & { projectName: string; projectId: string; isAnnotated: boolean }>;
    total: number;
    stats: {
      totalImages: number;
      totalProjects: number;
      annotatedImages: number;
    };
  }>;

  // Annotation methods
  getAnnotationsByImage(imageId: string): Promise<Annotation[]>;
  getAnnotationsByUser(userId: string): Promise<Annotation[]>;
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;

  // Project assignment methods
  assignUserToProject(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  getProjectAssignments(projectId: string): Promise<ProjectAssignment[]>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByCreator(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.createdBy, userId));
  }

  async getProjectsByAnnotator(userId: string): Promise<Project[]> {
    const assignments = await db
        .select({ project: projects })
        .from(projectAssignments)
        .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
        .where(eq(projectAssignments.userId, userId));

    const projectsWithProgress = await Promise.all(
        assignments.map(async (a) => {
          const progress = await this.getProjectProgress(a.project.id);
          return { ...a.project, ...progress };
        })
    );

    return projectsWithProgress;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProjectStatus(id: string, status: "not_started" | "in_progress" | "completed"): Promise<void> {
    await db.update(projects).set({ status }).where(eq(projects.id, id));
  }

  async getProjectProgress(projectId: string): Promise<{ totalImages: number, annotatedImages: number }> {
    const totalImages = await db.select().from(images).where(eq(images.projectId, projectId));
    const annotatedImages = await db
        .selectDistinct({ id: images.id })
        .from(images)
        .innerJoin(annotations, eq(images.id, annotations.imageId))
        .where(eq(images.projectId, projectId));

    return {
      totalImages: totalImages.length,
      annotatedImages: annotatedImages.length,
    };
  }

  // Label methods
  async getLabelsByProject(projectId: string): Promise<Label[]> {
    return await db.select().from(labels).where(eq(labels.projectId, projectId));
  }

  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const [label] = await db.insert(labels).values(insertLabel).returning();
    return label;
  }

  async deleteLabel(id: string): Promise<void> {
    await db.delete(labels).where(eq(labels.id, id));
  }

  // Image methods
  async getImagesByProject(projectId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.projectId, projectId));
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db.insert(images).values(insertImage).returning();
    return image;
  }

  // Annotation methods
  async getAnnotationsByImage(imageId: string): Promise<Annotation[]> {
    return await db.select().from(annotations).where(eq(annotations.imageId, imageId));
  }

  async getAnnotationsByUser(userId: string): Promise<Annotation[]> {
    return await db.select().from(annotations).where(eq(annotations.userId, userId));
  }

  async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    // Validate that the label and image belong to the same project
    const [image] = await db.select().from(images).where(eq(images.id, insertAnnotation.imageId));
    const [label] = await db.select().from(labels).where(eq(labels.id, insertAnnotation.labelId));

    if (!image) {
      throw new Error(`Image with id ${insertAnnotation.imageId} not found`);
    }

    if (!label) {
      throw new Error(`Label with id ${insertAnnotation.labelId} not found`);
    }

    if (image.projectId !== label.projectId) {
      throw new Error(
          `Label and image must belong to the same project. ` +
          `Image project: ${image.projectId}, Label project: ${label.projectId}`
      );
    }

    const [annotation] = await db.insert(annotations).values(insertAnnotation).returning();
    return annotation;
  }

  // Project assignment methods
  async assignUserToProject(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    // Check if assignment already exists
    const [existing] = await db
        .select()
        .from(projectAssignments)
        .where(
            and(
                eq(projectAssignments.projectId, insertAssignment.projectId),
                eq(projectAssignments.userId, insertAssignment.userId)
            )
        );

    if (existing) {
      // Return existing assignment instead of creating duplicate
      return existing;
    }

    const [assignment] = await db.insert(projectAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async getProjectAssignments(projectId: string): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId));
  }

  async deleteImage(id: string): Promise<void> {
    await db.delete(images).where(eq(images.id, id));
  }

  async getPortfolioImages(userId: string, filters?: {
    projectId?: string;
    sortBy?: 'uploadedAt' | 'projectName';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{
    images: Array<Image & { projectName: string; projectId: string; isAnnotated: boolean }>;
    total: number;
    stats: {
      totalImages: number;
      totalProjects: number;
      annotatedImages: number;
    };
  }> {
    const {
      projectId,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      limit = 50,
      offset = 0
    } = filters || {};

    // Build the base query for images with project and annotation data
    const query = db
      .select({
        id: images.id,
        projectId: images.projectId,
        filename: images.filename,
        url: images.url,
        uploadedAt: images.uploadedAt,
        projectName: projects.name,
        isAnnotated: sql<boolean>`CASE WHEN ${annotations.id} IS NOT NULL THEN true ELSE false END`
      })
      .from(images)
      .innerJoin(projects, eq(images.projectId, projects.id))
      .leftJoin(annotations, eq(images.id, annotations.imageId))
      .where(
        and(
          eq(projects.createdBy, userId),
          projectId ? eq(projects.id, projectId) : undefined
        )
      );

    // Apply ordering
    const orderBy = sortOrder === 'asc' ? asc : desc;
    if (sortBy === 'projectName') {
      query.orderBy(orderBy(projects.name));
    } else {
      query.orderBy(orderBy(images.uploadedAt));
    }

    // Get paginated results
    const portfolioImages = await query.limit(limit).offset(offset);

    // Get total count and stats
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .innerJoin(projects, eq(images.projectId, projects.id))
      .where(
        and(
          eq(projects.createdBy, userId),
          projectId ? eq(projects.id, projectId) : undefined
        )
      );

    const [{ count: total }] = await totalCountQuery;

    // Get stats
    const statsQuery = db
      .select({
        totalImages: sql<number>`count(distinct ${images.id})`,
        totalProjects: sql<number>`count(distinct ${projects.id})`,
        annotatedImages: sql<number>`count(distinct case when ${annotations.id} is not null then ${images.id} end)`
      })
      .from(images)
      .innerJoin(projects, eq(images.projectId, projects.id))
      .leftJoin(annotations, eq(images.id, annotations.imageId))
      .where(eq(projects.createdBy, userId));

    const [stats] = await statsQuery;

    return {
      images: portfolioImages,
      total,
      stats: {
        totalImages: Number(stats.totalImages),
        totalProjects: Number(stats.totalProjects),
        annotatedImages: Number(stats.annotatedImages)
      }
    };
  }
}

export const storage = new DbStorage();