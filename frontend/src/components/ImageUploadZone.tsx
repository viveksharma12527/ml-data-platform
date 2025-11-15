import { useState, useRef, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, FileArchive, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    acceptZip?: boolean;
    disabled?: boolean;
}

export function ImageUploadZone({
                                    onFilesSelected,
                                    maxFiles = 1000,
                                    maxFileSize = 20,
                                    acceptZip = true,
                                    disabled = false,
                                }: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        // Filter images and ZIP files separately
        const imageFiles = files.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= maxFileSize * 1024 * 1024
        );

        const zipFiles = files.filter(file =>
                acceptZip && (
                    file.type === 'application/zip' ||
                    file.type === 'application/x-zip-compressed' ||
                    file.name.toLowerCase().endsWith('.zip')
                ) &&
                file.size <= 1000 * 1024 * 1024 // 200MB for ZIP
        );

        // Combine valid files
        const validFiles = [...imageFiles, ...zipFiles];

        if (validFiles.length === 0 && files.length > 0) {
            // Some files were rejected
            alert(`No valid files selected. Please select images (max ${maxFileSize}MB) or ZIP files (max 200MB).`);
            return;
        }

        // Limit to maxFiles
        const filesToAdd = validFiles.slice(0, maxFiles - selectedFiles.length);
        const newFiles = [...selectedFiles, ...filesToAdd];
        setSelectedFiles(newFiles);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles);
            setSelectedFiles([]);
        }
    };

    const clearAll = () => {
        setSelectedFiles([]);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <Card
                className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer",
                    isDragging && "border-primary bg-primary/5",
                    !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <div className="p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                        {isDragging ? 'Drop files here' : 'Drag & drop images or ZIP here'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        or click to browse
                    </p>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <p>• Multiple images and ZIP files supported</p>
                        <p>• Max {maxFiles} images, {maxFileSize}MB each</p>
                        <p>• ZIP files up to 1GB (auto-extract)</p>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.zip"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={disabled}
                    />
                </div>
            </Card>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Selected: {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            disabled={disabled}
                        >
                            Clear All
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                        {selectedFiles.map((file, index) => {
                            const isZip = file.name.toLowerCase().endsWith('.zip');
                            return (
                                <Card key={index} className="relative group">
                                    <div className="p-3">
                                        {isZip ? (
                                            <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                                                <FileArchive className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeFile(index)}
                                            disabled={disabled}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleUpload}
                        disabled={disabled || selectedFiles.length === 0}
                    >
                        Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    );
}