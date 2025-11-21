import { db } from "./db";
import {
  users, type InsertUser, type User,
  projects, type InsertProject, type Project,
  labels, type InsertLabel, type Label,
  labelClasses, type  InsertLabelClass, type LabelClass,
  images, type InsertImage, type Image,
  annotations, type InsertAnnotation, type Annotation,
  projectAssignments, type InsertProjectAssignment, type ProjectAssignment,
  projectImages, type InsertProjectImage, type ProjectImage
} from "@shared/schema";
import { eq, and, desc, asc, sql, count, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: 'annotator' | 'data_specialist' | 'admin'): Promise<void>;

  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByCreator(userId: string): Promise<Project[]>;
  getProjectsByAnnotator(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  // getProjectProgress(projectId: string): Promise<{ totalImages: number, annotatedImages: number }>;
  updateProjectStatus(id: string, status: "not_started" | "in_progress" | "completed"): Promise<void>;

  assignImagesToProject(projectId: string, imageIds: string[]): Promise<ProjectImage[]>

  getProjectStats(projectId: string): Promise<{
    numberOfImages: number;
    annotatedImages: number;
    totalAnnotations: number;
    activeAnnotators: number;
  }>

  // Label methods
  // getLabelsByProject(projectId: string): Promise<Label[]>;
  createLabel(label: InsertLabel): Promise<Label>;
  deleteLabel(id: string): Promise<void>;


  
  getAllLabelTypes(): Promise<(Label & { classCount: number })[]>;
  getLabelType(id: string): Promise<(Label & { classCount: number }) | undefined>;
  // createLabelType(labelType: InsertLabel): Promise<Label>;
  updateLabelType(id: string, labelType: Partial<InsertLabel>): Promise<Label>;
  deleteLabelTypes(ids: string[]): Promise<Label[]>;
  
  // Label Class methods
  getLabelClassesByType(labelTypeId: string): Promise<LabelClass[]>;
  addLabelClass(labelClass: InsertLabelClass): Promise<LabelClass>;
  removeLabelClass(labelTypeId: string, classId: string): Promise<LabelClass>;


  // Image methods
  getImagesByProject(projectId: string): Promise<Image[]>;
  getImage(id: string): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: string): Promise<void>;
  getAllImages(): Promise<Image[] | undefined>

  // getPortfolioImages(userId: string, filters?: {
  //   projectId?: string;
  //   sortBy?: 'uploadedAt' | 'projectName';
  //   sortOrder?: 'asc' | 'desc';
  //   limit?: number;
  //   offset?: number;
  // }): Promise<{
  //   images: Array<Image & { projectName: string; projectId: string; isAnnotated: boolean }>;
  //   total: number;
  //   stats: {
  //     totalImages: number;
  //     totalProjects: number;
  //     annotatedImages: number;
  //   };
  // }>;

  // Annotation methods
  getAnnotationsByImage(imageId: string): Promise<Annotation[]>;
  getAnnotationsByUser(userId: string): Promise<Annotation[]>;
  // createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;


  // using the images assignment table


  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  deleteAnnotation(annotationId: string, annotatorId?: string): Promise<Annotation>;
  getAnnotation(id: string): Promise<(Annotation & {
    imageFilename: string;
    imageUrl: string;
    labelClassName: string;
    labelTypeName: string;
    annotatorUsername: string;
  }) | undefined>;

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

  async updateUserRole(id: string, role: 'annotator' | 'data_specialist' | 'admin'): Promise<void> {
  await db.update(users).set({ role }).where(eq(users.id, id));}
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
          // const progress = await this.getProjectProgress(a.project.id);
          // return { ...a.project, ...progress };
          return { ...a.project};
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

  // async getProjectProgress(projectId: string): Promise<{ totalImages: number, annotatedImages: number }> {
  //   // const totalImages = await db.select().from(images).where(eq(images.projectId, projectId));
  //   const annotatedImages = await db
  //       .selectDistinct({ id: images.id })
  //       .from(images)
  //       .innerJoin(annotations, eq(images.id, annotations.imageId))
  //       .where(eq(images.projectId, projectId));

  //   return {
  //     // totalImages: totalImages.length,
  //     annotatedImages: annotatedImages.length,
  //   };
  // }

  // Label methods
  // async getLabelsByProject(projectId: string): Promise<Label[]> {
  //   return await db.select().from(labels).where(eq(labels.projectId, projectId));
  // }

  async assignImagesToProject(projectId: string, imageIds: string[]): Promise<ProjectImage[]> {
    if (imageIds.length === 0) return [];

    // Check if images exist
    const existingImages = await db
    .select({ id: images.id })
    .from(images)
    .where(inArray(images.id, imageIds)); 

    if (existingImages.length !== imageIds.length) {
      throw new Error("Some images not found");
    }

    // Create project image assignments
    const assignments = imageIds.map(imageId => ({
      projectId,
      imageId
    }));

    const result = await db
      .insert(projectImages)
      .values(assignments)
      .onConflictDoNothing() 
      .returning();

    return result;
}



  async createLabel(insertLabel: InsertLabel): Promise<Label> {
    const [label] = await db.insert(labels).values(insertLabel).returning();
    return label;
  }

  async deleteLabel(id: string): Promise<void> {
    await db.delete(labels).where(eq(labels.id, id));
  }


  
  async getAllLabelTypes(): Promise<(Label & { classCount: number })[]> {
    const result = await db.select({id: labels.id,name: labels.name, description: labels.description, createdAt: labels.createdAt, classCount: count(labelClasses.id),}).from(labels).leftJoin(labelClasses, eq(labels.id, labelClasses.labelTypeId)).groupBy(labels.id).orderBy(labels.createdAt);

    return result;
  }
  async getLabelType(id: string): Promise<(Label & { classCount: number }) | undefined> {
    const result = await db.select({id: labels.id, name: labels.name, description: labels.description, createdAt: labels.createdAt, classCount: count(labelClasses.id),}).from(labels).leftJoin(labelClasses, eq(labels.id, labelClasses.labelTypeId)).where(eq(labels.id, id)).groupBy(labels.id);

    return result[0] || undefined;
  }

  async updateLabelType(id: string, labelTypeData: Partial<InsertLabel>): Promise<Label> {
    const [labelType] = await db.update(labels).set(labelTypeData).where(eq(labels.id, id)).returning();

    if (!labelType) {
      throw new Error(`Label type with id ${id} not found`);
    }

    return labelType;
  }

  async deleteLabelTypes(ids: string[]): Promise<Label[]> {
    if (ids.length === 0) return [];
  

    const validIds = ids.filter(id => id && id.trim() !== '');
    
    if (validIds.length === 0) return [];

    const result = await db.delete(labels)
       .where(inArray(sql`${labels.id}::text`, validIds))
      .returning();
    return result;
  }
  
  // Label Class Methods
  async getLabelClassesByType(labelTypeId: string): Promise<LabelClass[]> {
    return await db.select().from(labelClasses).where(eq(labelClasses.labelTypeId, labelTypeId)).orderBy(labelClasses.name);
  }

  async addLabelClass(insertClass: InsertLabelClass): Promise<LabelClass> {
    const [labelClass] = await db.insert(labelClasses).values(insertClass).returning();
    return labelClass;
  }

  async removeLabelClass(labelTypeId: string, classId: string): Promise<LabelClass> {
    const [labelClass] = await db.delete(labelClasses).where(and(eq(labelClasses.id, classId),eq(labelClasses.labelTypeId, labelTypeId))).returning();
    if (!labelClass) {
      throw new Error(`Label class with id ${classId} not found in label type ${labelTypeId}`);
    }
    return labelClass;
  }



  // // Image methods
  // async getImagesByProject(projectId: string): Promise<Image[]> {
  //   return await db.select().from(images).where(eq(images.projectId, projectId));
  // }

  async getImagesByProject(projectId: string): Promise<Image[]> {
  const result = await db
    .select({
      id: images.id,
      filename: images.filename,
      url: images.url,
      uploadedAt: images.uploadedAt,
    })
    .from(projectImages)
    .innerJoin(images, eq(projectImages.imageId, images.id))
    .where(eq(projectImages.projectId, projectId))
    .orderBy(images.uploadedAt);

  return result;
}

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db.insert(images).values(insertImage).returning();
    return image;
  }

  async getAllImages(): Promise<Image[] | undefined> {
    const image = await db.select().from(images);
    return image;
  }

  // Annotation methods
  async getAnnotationsByImage(imageId: string): Promise<Annotation[]> {
    return await db.select().from(annotations).where(eq(annotations.imageId, imageId));
  }

  async getAnnotationsByUser(userId: string): Promise<Annotation[]> {
    return await db.select().from(annotations).where(eq(annotations.userId, userId));
  }

  // async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
  //   // Validate that the label and image belong to the same project
  //   const [image] = await db.select().from(images).where(eq(images.id, insertAnnotation.imageId));
  //   const [label] = await db.select().from(labels).where(eq(labels.id, insertAnnotation.labelId));

  //   if (!image) {
  //     throw new Error(`Image with id ${insertAnnotation.imageId} not found`);
  //   }

  //   if (!label) {
  //     throw new Error(`Label with id ${insertAnnotation.labelId} not found`);
  //   }

  //   if (image.projectId !== label.projectId) {
  //     throw new Error(
  //         `Label and image must belong to the same project. ` +
  //         `Image project: ${image.projectId}, Label project: ${label.projectId}`
  //     );
  //   }

  //   const [annotation] = await db.insert(annotations).values(insertAnnotation).returning();
  //   return annotation;
  // }


async createAnnotation(insertAnnotation: InsertAnnotation): Promise<Annotation> {
    const [annotation] = await db.insert(annotations).values(insertAnnotation).returning();
    return annotation;
  }

  async deleteAnnotation(annotationId: string, annotatorId?: string): Promise<Annotation> {
    let whereCondition;
  
  if (annotatorId) {
    // User can only delete their own annotations
    whereCondition = and(
      eq(annotations.id, annotationId),
      eq(annotations.userId, annotatorId)
    );
  } else {
    // Admin/Data Specialist can delete any annotation
    whereCondition = eq(annotations.id, annotationId);
  }

  const [deletedAnnotation] = await db.delete(annotations).where(whereCondition).returning();

    if (!deletedAnnotation) {
      throw new Error(`Annotation with id ${annotationId} not found${annotatorId ? ' or access denied' : ''}`);
    }

    return deletedAnnotation;
  }


  // Get Annotation by ID with details
  async getAnnotation(id: string): Promise<(Annotation & {
    imageFilename: string;
    imageUrl: string;
    labelClassName: string;
    labelTypeName: string;
    annotatorUsername: string;
  }) | undefined> {
    const result = await db
      .select({
        // Annotation fields
        id: annotations.id,
        projectId: annotations.projectId,
        imageId: annotations.imageId,
        userId: annotations.userId,
        labelClassesId: annotations.labelClassesId,
        annotatedAt: annotations.annotatedAt,
        labelId: annotations.labelId,
        
        // Joined fields
        imageFilename: images.filename,
        imageUrl: images.url,
        labelClassName: labelClasses.name,
        labelTypeName: labels.name,
        annotatorUsername: users.name,
      })
      .from(annotations)
      .innerJoin(images, eq(annotations.imageId, images.id))
      .innerJoin(labelClasses, eq(annotations.labelClassesId, labelClasses.id))
      .innerJoin(labels, eq(labelClasses.labelTypeId, labels.id))
      .innerJoin(users, eq(annotations.userId, users.id))
      .where(eq(annotations.id, id));

    return result[0] || undefined;
  }

  async getAnnotationsByProjectAndAnnotator(projectId: string, annotatorId: string): Promise<any[]> {
    const result = await db
      .select({
        id: annotations.id,
        projectId: annotations.projectId,
        imageId: annotations.imageId,
        userId: annotations.userId,
        labelClassesId: annotations.labelClassesId,
        annotatedAt: annotations.annotatedAt,
        imageFilename: images.filename,
        imageUrl: images.url,
        labelClassName: labelClasses.name,
        labelTypeName: labels.name,
      })
      .from(annotations)
      .innerJoin(images, eq(annotations.imageId, images.id))
      .innerJoin(labelClasses, eq(annotations.labelClassesId, labelClasses.id))
      .innerJoin(labels, eq(labelClasses.labelTypeId, labels.id))
      .where(
        and(
          eq(annotations.projectId, projectId),
          eq(annotations.userId, annotatorId)
        )
      )
      .orderBy(desc(annotations.annotatedAt));

    return result;
  }

  async getAnnotationsByProject(projectId: string): Promise<any[]> {
    const result = await db
      .select({
        id: annotations.id,
        projectId: annotations.projectId,
        imageId: annotations.imageId,
        userId: annotations.userId,
        labelClassesId: annotations.labelClassesId,
        annotatedAt: annotations.annotatedAt,
        imageFilename: images.filename,
        imageUrl: images.url,
        labelClassName: labelClasses.name,
        labelTypeName: labels.name,
        annotatorUsername: users.name,
        annotatorFirstName: users.firstName,
        annotatorLastName: users.lastName,
      })
      .from(annotations)
      .innerJoin(images, eq(annotations.imageId, images.id))
      .innerJoin(labelClasses, eq(annotations.labelClassesId, labelClasses.id))
      .innerJoin(labels, eq(labelClasses.labelTypeId, labels.id))
      .innerJoin(users, eq(annotations.userId, users.id))
      .where(eq(annotations.projectId, projectId))
      .orderBy(desc(annotations.annotatedAt));

    return result;
  }

    // Get annotation statistics for a project
  async getProjectStats(projectId: string): Promise<{
    numberOfImages: number;
    annotatedImages: number;
    totalAnnotations: number;
    activeAnnotators: number;
  }> {
    const result = await db
      .select({
        totalAnnotations: count(annotations.id),
        annotatedImages: count(sql`DISTINCT ${annotations.imageId}`),
        activeAnnotators: count(sql`DISTINCT ${annotations.userId}`),
      })
      .from(annotations)
      .where(eq(annotations.projectId, projectId));

      const projectResult = await db.select({
        numberOfImages: count(projectImages.id),
      })
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId));

    return {
      numberOfImages: Number(projectResult[0].numberOfImages || 0),
      annotatedImages: Number(result[0]?.annotatedImages || 0),
      totalAnnotations: Number(result[0]?.totalAnnotations || 0),
      activeAnnotators: Number(result[0]?.activeAnnotators || 0),
    };
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

  // async getPortfolioImages(userId: string, filters?: {
  //   projectId?: string;
  //   sortBy?: 'uploadedAt' | 'projectName';
  //   sortOrder?: 'asc' | 'desc';
  //   limit?: number;
  //   offset?: number;
  // }): Promise<{
  //   images: Array<Image & { projectName: string; projectId: string; isAnnotated: boolean }>;
  //   total: number;
  //   stats: {
  //     totalImages: number;
  //     totalProjects: number;
  //     annotatedImages: number;
  //   };
  // }> {
  //   const {
  //     projectId,
  //     sortBy = 'uploadedAt',
  //     sortOrder = 'desc',
  //     limit = 50,
  //     offset = 0
  //   } = filters || {};

  //   // Build the base query for images with project and annotation data
  //   const query = db
  //     .select({
  //       id: images.id,
  //       projectId: images.projectId,
  //       filename: images.filename,
  //       url: images.url,
  //       uploadedAt: images.uploadedAt,
  //       projectName: projects.name,
  //       isAnnotated: sql<boolean>`CASE WHEN ${annotations.id} IS NOT NULL THEN true ELSE false END`
  //     })
  //     .from(images)
  //     .innerJoin(projects, eq(images.projectId, projects.id))
  //     .leftJoin(annotations, eq(images.id, annotations.imageId))
  //     .where(
  //       and(
  //         eq(projects.createdBy, userId),
  //         projectId ? eq(projects.id, projectId) : undefined
  //       )
  //     );

  //   // Apply ordering
  //   const orderBy = sortOrder === 'asc' ? asc : desc;
  //   if (sortBy === 'projectName') {
  //     query.orderBy(orderBy(projects.name));
  //   } else {
  //     query.orderBy(orderBy(images.uploadedAt));
  //   }

  //   // Get paginated results
  //   const portfolioImages = await query.limit(limit).offset(offset);

  //   // Get total count and stats
  //   const totalCountQuery = db
  //     .select({ count: sql<number>`count(*)` })
  //     .from(images)
  //     .innerJoin(projects, eq(images.projectId, projects.id))
  //     .where(
  //       and(
  //         eq(projects.createdBy, userId),
  //         projectId ? eq(projects.id, projectId) : undefined
  //       )
  //     );

  //   const [{ count: total }] = await totalCountQuery;

  //   // Get stats
  //   const statsQuery = db
  //     .select({
  //       totalImages: sql<number>`count(distinct ${images.id})`,
  //       totalProjects: sql<number>`count(distinct ${projects.id})`,
  //       annotatedImages: sql<number>`count(distinct case when ${annotations.id} is not null then ${images.id} end)`
  //     })
  //     .from(images)
  //     .innerJoin(projects, eq(images.projectId, projects.id))
  //     .leftJoin(annotations, eq(images.id, annotations.imageId))
  //     .where(eq(projects.createdBy, userId));

  //   const [stats] = await statsQuery;

  //   return {
  //     images: portfolioImages,
  //     total,
  //     stats: {
  //       totalImages: Number(stats.totalImages),
  //       totalProjects: Number(stats.totalProjects),
  //       annotatedImages: Number(stats.annotatedImages)
  //     }
  //   };
  // }
}

export const storage = new DbStorage();