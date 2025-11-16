import React from 'react';

const ImageGallery = () => {
  // Placeholder data
  const images = [
    { id: 1, name: 'image1.jpg', size: '1.2 MB', thumbnail: 'https://via.placeholder.com/150' },
    { id: 2, name: 'image2.png', size: '2.5 MB', thumbnail: 'https://via.placeholder.com/150' },
    { id: 3, name: 'image3.gif', size: '500 KB', thumbnail: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="border rounded-lg p-4">
          <img src={image.thumbnail} alt={image.name} className="w-full h-32 object-cover mb-2" />
          <p className="font-semibold">{image.name}</p>
          <p className="text-sm text-gray-500">{image.size}</p>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;