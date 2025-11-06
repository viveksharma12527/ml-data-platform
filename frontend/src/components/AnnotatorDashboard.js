import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AnnotatorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [annotations, setAnnotations] = useState([]);
  const images = ['/images/image1.jpg', '/images/image2.jpg', '/images/image3.jpg'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleStartAnnotation = () => {
    setIsAnnotating(true);
  };

  const handleNextImage = (annotation) => {
    setAnnotations([...annotations, { image: images[currentImageIndex], annotation }]);
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setIsComplete(true);
      setIsAnnotating(false);
    }
  };

  if (isComplete) {
    return (
      <div>
        <h2>Annotator Dashboard</h2>
        <p>Welcome, {currentUser.email}</p>
        <p>Annotation complete</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Annotator Dashboard</h2>
      <p>Welcome, {currentUser.email}</p>
      {!isAnnotating ? (
        <>
          <p>{images.length - currentImageIndex} images left to annotate</p>
          <button onClick={handleStartAnnotation}>Start Annotation</button>
        </>
      ) : (
        <div>
          <img src={images[currentImageIndex]} alt="for annotation" />
          <div>
            <button onClick={() => handleNextImage('Label 1')}>Label 1</button>
            <button onClick={() => handleNextImage('Label 2')}>Label 2</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotatorDashboard;