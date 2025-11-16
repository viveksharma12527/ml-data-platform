import { type Annotation, type InsertAnnotation } from "@shared/schema";

export const createAnnotation = async (annotationData: InsertAnnotation): Promise<Annotation> => {
  const response = await fetch("/api/annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(annotationData),
  });
  if (!response.ok) {
    throw new Error("Failed to create annotation");
  }
  return response.json();
};

export const getAnnotationsByImage = async (imageId: string): Promise<Annotation[]> => {
  const response = await fetch(`/api/images/${imageId}/annotations`);
  if (!response.ok) {
    throw new Error("Failed to fetch annotations");
  }
  return response.json();
};