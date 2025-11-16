export const fetchProjects = async () => {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const createProject = async (project: { name: string; description: string | null; status: string }) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
};

export const uploadImages = async (projectId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/projects/${projectId}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  return response.json();
};

export const createLabel = async (projectId: string, label: { name: string }) => {
  const response = await fetch(`/api/projects/${projectId}/labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(label),
  });

  if (!response.ok) {
    throw new Error('Failed to create label');
  }

  return response.json();
};

export const addImageUrl = async (projectId: string, imageUrl: string) => {
  const response = await fetch(`/api/projects/${projectId}/images/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to add image from URL');
  }

  return response.json();
};

export const fetchImages = async (projectId: string) => {
  const response = await fetch(`/api/projects/${projectId}/images`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};