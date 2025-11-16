import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';

interface PortfolioImageCardProps {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  projectName: string;
  projectId: string;
  isAnnotated: boolean;
  onDelete?: (imageId: string) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export function PortfolioImageCard({
  id,
  filename,
  url,
  uploadedAt,
  projectName,
  projectId,
  isAnnotated,
  onDelete,
  onNavigateToProject,
}: PortfolioImageCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleProjectClick = () => {
    if (onNavigateToProject) {
      onNavigateToProject(projectId);
    }
  };

  return (
    <Card data-testid={`card-portfolio-image-${id}`}>
      <CardContent className="p-4">
        <div className="relative group">
          <img
            src={url}
            alt={filename}
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              data-testid={`button-delete-portfolio-image-${id}`}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium truncate" title={filename}>
            {filename}
          </p>
          <div className="flex items-center justify-between">
            <button
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={handleProjectClick}
              data-testid={`link-project-${projectId}`}
            >
              <span className="truncate max-w-[120px]">{projectName}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </button>
            <Badge
              variant={isAnnotated ? "default" : "secondary"}
              className="text-xs"
              data-testid={`badge-annotation-${isAnnotated ? 'annotated' : 'pending'}`}
            >
              {isAnnotated ? 'Annotated' : 'Pending'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}