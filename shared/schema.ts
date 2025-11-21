import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["annotator", "data_specialist", "admin", "ml_engineer"]);
export const projectStatusEnum = pgEnum("project_status", ["not_started", "in_progress", "completed"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  labelTypeId: varchar("label_type_id").references(() => labels.id),
  status: projectStatusEnum("status").notNull().default("not_started"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Labels table
export const labels = pgTable("labels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabelSchema = createInsertSchema(labels).omit({
  id: true,
  createdAt: true,
});

export type InsertLabel = z.infer<typeof insertLabelSchema>;
export type Label = typeof labels.$inferSelect;


// label classes
export const labelClasses = pgTable("label_classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  labelTypeId: varchar("label_type_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabelClassSchema = createInsertSchema(labelClasses).omit({
  id: true,
  createdAt: true,
});

export type InsertLabelClass = z.infer<typeof insertLabelClassSchema>;
export type LabelClass = typeof labelClasses.$inferSelect;



// Images table
export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;


// Project images   
export const projectImages = pgTable("project_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  imageId: varchar("image_id").notNull().references(() => images.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate project assignments for the same image
  uniqueProjectImage: sql`UNIQUE (${table.projectId}, ${table.imageId})`,
}));

export const insertProjectImageSchema = createInsertSchema(projectImages).omit({
  id: true,
  assignedAt: true,
});
export const insertProjectImagesSchema = z.object({
  imageIds: z.array(z.string().uuid()).min(1, "At least one image ID is required")
});


export type InsertProjectImage = z.infer<typeof insertProjectImageSchema>;
export type ProjectImage = typeof projectImages.$inferSelect;


// Annotations table
export const annotations = pgTable("annotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId:varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  imageId: varchar("image_id").notNull().references(() => images.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  labelId: varchar("label_id").notNull().references(() => labels.id), // the annotations are done with classes not labels 
  labelClassesId: varchar("label_class_id").notNull().references(() => labelClasses.id),
  annotatedAt: timestamp("annotated_at").defaultNow().notNull(),
},(table) => ({
  // Prevent duplicate annotation with the same class for the same image
  uniqueUserProject: sql`UNIQUE (${table.imageId}, ${table.labelClassesId})`,
}));

export const insertAnnotationSchema = createInsertSchema(annotations).omit({
  id: true,
  annotatedAt: true,
});

export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotations.$inferSelect;

// Project assignments table (which annotators are assigned to which projects)
export const projectAssignments = pgTable("project_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate project assignments for the same user
  uniqueUserProject: sql`UNIQUE (${table.projectId}, ${table.userId})`,
}));

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({
  id: true,
  assignedAt: true,
});

export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;
export type ProjectAssignment = typeof projectAssignments.$inferSelect;
