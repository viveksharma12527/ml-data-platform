import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react';
import { uploadImages, addImageUrl } from '@/services/projects';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ImageUploadDialogProps {
  projectId: string;
  onUploadComplete: () => void;
}

export default function ImageUploadDialog({ projectId, onUploadComplete }: ImageUploadDialogProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: true,
  });

  const handleRemoveFile = (file: File) => {
    setFiles(prevFiles => prevFiles.filter(f => f !== file));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select one or more image files to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      await uploadImages(projectId, files);
      toast({
        title: 'Upload successful',
        description: `${files.length} images have been uploaded.`,
      });
      setFiles([]);
      onUploadComplete();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading the images.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: 'No URL entered',
        description: 'Please enter an image URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      await addImageUrl(projectId, imageUrl);
      toast({
        title: 'Image added successfully',
        description: 'The image has been added from the URL.',
      });
      setImageUrl('');
      onUploadComplete();
    } catch (error) {
      toast({
        title: 'Failed to add image',
        description: 'An error occurred while adding the image from the URL.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Tabs defaultValue="local">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="local">From Local</TabsTrigger>
        <TabsTrigger value="url">From URL</TabsTrigger>
      </TabsList>
      <TabsContent value="local">
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            {isDragActive ? (
              <p className="mt-2 text-primary">Drop the files here ...</p>
            ) : (
              <p className="mt-2 text-muted-foreground">Drag & drop some files here, or click to select files</p>
            )}
          </div>

          {files.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Selected Files:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={isUploading || files.length === 0} className="w-full">
            {isUploading ? 'Uploading...' : `Upload ${files.length} Image(s)`}
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="url">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="image-url">Image URL</label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <Button onClick={handleAddUrl} disabled={isUploading || !imageUrl.trim()} className="w-full">
            {isUploading ? 'Adding...' : 'Add Image from URL'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}