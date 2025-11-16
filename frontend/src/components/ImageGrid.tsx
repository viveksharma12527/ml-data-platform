import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchImages } from '@/services/projects';

const ImageGrid = ({ projectId }: { projectId: string }) => {
  const { data: images, error, isLoading } = useQuery({
    queryKey: ['images', projectId],
    queryFn: () => fetchImages(projectId),
  });
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image: any) => (
          <Card key={image.id} onClick={() => handleImageClick(image)} className="cursor-pointer">
            <CardHeader>
              <CardTitle>{image.filename}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={`/api${image.url}`} alt={image.filename} className="w-full h-32 object-cover" />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">{(image.size / 1024).toFixed(2)} KB</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedImage.filename}</DialogTitle>
            </DialogHeader>
            <img src={`/api${selectedImage.url}`} alt={selectedImage.filename} className="w-full h-auto object-contain" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ImageGrid;