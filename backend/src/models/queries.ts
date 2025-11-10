import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });
import { db } from "./db";
import { users, projects, labels, images, annotations, projectAssignments } from "./src/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running queries...");

  // 1. Get all users
  const allUsers = await db.select().from(users);
  console.log("All users:", allUsers);

  // 2. Get all projects
  const allProjects = await db.select().from(projects);
  console.log("All projects:", allProjects);

  // 3. Get all labels for a specific project
  const firstProject = allProjects;
  if (firstProject) {
    const projectLabels = await db.select().from(labels).where(sql`${labels.projectId} = ${firstProject.id}`);
    console.log(`Labels for project ${firstProject.id}:`, projectLabels);
  }

  // 4. Get all images for a specific project
  if (firstProject) {
    const projectImages = await db.select().from(images).where(sql`${images.projectId} = ${firstProject.id}`);
    console.log(`Images for project ${firstProject.id}:`, projectImages);
  }

  // 5. Get all annotations for a specific image
  const firstImage = (await db.select().from(images).limit(1));
  if (firstImage) {
    const imageAnnotations = await db.select().from(annotations).where(sql`${annotations.imageId} = ${firstImage.id}`);
    console.log(`Annotations for image ${firstImage.id}:`, imageAnnotations);
  }

  // 6. Get all projects assigned to a specific user
  const firstUser = allUsers;
  if (firstUser) {
    const userProjects = await db.select().from(projectAssignments).where(sql`${projectAssignments.userId} = ${firstUser.id}`);
    console.log(`Projects assigned to user ${firstUser.id}:`, userProjects);
  }

  console.log("Queries finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});