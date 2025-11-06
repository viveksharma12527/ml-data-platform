import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DataSpecialistDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState(['label1', 'label2']);
  const [newLabel, setNewLabel] = useState('');
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() !== '') {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim() !== '') {
      const newProject = {
        name: newProjectName.trim(),
        status: 'In Progress',
        images,
        labels,
      };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setImages([]);
    }
  };

  return (
    <div>
      <h2>Data Specialist Dashboard</h2>
      <p>Welcome, {currentUser?.email}</p>

      <div>
        <h3>Upload Images</h3>
        <input type="file" multiple onChange={handleImageUpload} />
        <div>
          {images.map((image, index) => (
            <p key={index}>{image.name}</p>
          ))}
        </div>
      </div>

      <div>
        <h3>Manage Labels</h3>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Enter new label"
        />
        <button onClick={handleAddLabel}>Add Label</button>
        <ul>
          {labels.map((label, index) => (
            <li key={index}>{label}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Create New Project</h3>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Enter project name"
        />
        <button onClick={handleCreateProject}>Create Project</button>
      </div>

      <div>
        <h3>Projects</h3>
        <ul>
          {projects.map((project, index) => (
            <li key={index}>
              {project.name} - {project.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataSpecialistDashboard;