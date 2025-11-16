import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  projectName: string;
  projectId: string;
  isAnnotated: boolean;
}

interface PortfolioStats {
  totalImages: number;
  totalProjects: number;
  annotatedImages: number;
}

interface PortfolioData {
  images: PortfolioImage[];
  total: number;
  stats: PortfolioStats;
}

interface PortfolioFilters {
  projectId?: string;
  sortBy?: 'uploadedAt' | 'projectName';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function usePortfolio() {
  const { toast } = useToast();

  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PortfolioFilters>({
    sortBy: 'uploadedAt',
    sortOrder: 'desc',
    limit: 50,
    offset: 0,
  });

  const loadImages = useCallback(async (newFilters?: PortfolioFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryFilters = newFilters || filters;

      // Build query string
      const queryParams = new URLSearchParams();
      if (queryFilters.projectId) {
        queryParams.append('projectId', queryFilters.projectId);
      }
      if (queryFilters.sortBy) {
        queryParams.append('sortBy', queryFilters.sortBy);
      }
      if (queryFilters.sortOrder) {
        queryParams.append('sortOrder', queryFilters.sortOrder);
      }
      if (queryFilters.limit) {
        queryParams.append('limit', queryFilters.limit.toString());
      }
      if (queryFilters.offset) {
        queryParams.append('offset', queryFilters.offset.toString());
      }

      const response = await fetch(`/api/portfolio/images?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load portfolio images');
      }

      const portfolioData = await response.json();
      setData(portfolioData);

      if (newFilters) {
        setFilters(queryFilters);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load portfolio images';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const loadStats = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/portfolio/images', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load portfolio stats');
      }

      const portfolioData = await response.json();

      setData(prev => prev ? { ...prev, stats: portfolioData.stats } : portfolioData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load portfolio stats';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove image from local state
      setData(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img.id !== imageId),
        total: prev.total - 1,
        stats: {
          ...prev.stats,
          totalImages: prev.stats.totalImages - 1,
          annotatedImages: prev.images.find(img => img.id === imageId)?.isAnnotated
            ? prev.stats.annotatedImages - 1
            : prev.stats.annotatedImages,
        }
      } : null);

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete image';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err; // Re-throw to let caller handle if needed
    }
  }, [toast]);

  const updateFilters = useCallback((newFilters: Partial<PortfolioFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, offset: 0 }; // Reset offset when filters change
    setFilters(updatedFilters);
    loadImages(updatedFilters);
  }, [filters, loadImages]);

  const loadMore = useCallback(() => {
    const newFilters = {
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 50),
    };
    setFilters(newFilters);

    // Load more data and append to existing
    const queryParams = new URLSearchParams();
    if (newFilters.projectId) {
      queryParams.append('projectId', newFilters.projectId);
    }
    if (newFilters.sortBy) {
      queryParams.append('sortBy', newFilters.sortBy);
    }
    if (newFilters.sortOrder) {
      queryParams.append('sortOrder', newFilters.sortOrder);
    }
    if (newFilters.limit) {
      queryParams.append('limit', newFilters.limit.toString());
    }
    if (newFilters.offset) {
      queryParams.append('offset', newFilters.offset.toString());
    }

    fetch(`/api/portfolio/images?${queryParams.toString()}`, {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load more images');
        }
        return response.json();
      })
      .then(newData => {
        setData(prev => prev ? {
          ...prev,
          images: [...prev.images, ...newData.images],
        } : newData);
      })
      .catch(err => {
        console.error('Load more error:', err);
        toast({
          title: 'Error',
          description: 'Failed to load more images',
          variant: 'destructive',
        });
      });
  }, [filters, toast]);

  // Load initial data
  useEffect(() => {
    loadImages();
  }, []); // Only run once on mount

  return {
    data,
    isLoading,
    error,
    filters,
    loadImages,
    loadStats,
    deleteImage,
    updateFilters,
    loadMore,
  };
}