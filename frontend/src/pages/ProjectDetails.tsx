import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, ArrowLeft, Plus, X, Upload, Image as ImageIcon, Users, Tag, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ImageUploadDialog from '@/components/ImageUploadDialog';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: 'not_started' | 'in_progress' | 'completed';
    createdAt: string;
}

interface Label {
    id: string;
    projectId: string;
    name: string;
}

interface Image {
    id: string;
    projectId: string;
    filename: string;
    url: string;
    uploadedAt: string;
}

interface Assignment {
    id: string;
    projectId: string;
    userId: string;
    assignedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function ProjectDetail() {
    const params = useParams();
    const projectId = params.id || '';
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [labels, setLabels] = useState<Label[]>([]);
    const [images, setImages] = useState<Image[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [availableAnnotators, setAvailableAnnotators] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newLabelName, setNewLabelName] = useState('');
    const [isAddingLabel, setIsAddingLabel] = useState(false);
    const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

    const [imageUrl, setImageUrl] = useState('');
    const [imageFilename, setImageFilename] = useState('');
    const [isAddingImage, setIsAddingImage] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const [selectedAnnotatorId, setSelectedAnnotatorId] = useState('');
    const [isAssigningUser, setIsAssigningUser] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch current user
            const userResponse = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (!userResponse.ok) {
                setLocation('/login');
                return;
            }

            const userData = await userResponse.json();
            setUser(userData);

            // Fetch project
            const projectResponse = await fetch(`/api/projects/${projectId}`, {
                credentials: 'include',
            });

            if (!projectResponse.ok) {
                throw new Error('Failed to load project');
            }

            const projectData = await projectResponse.json();
            setProject(projectData);

            // Fetch labels
            const labelsResponse = await fetch(`/api/projects/${projectId}/labels`, {
                credentials: 'include',
            });

            if (labelsResponse.ok) {
                const labelsData = await labelsResponse.json();
                setLabels(labelsData);
            }

            // Fetch images
            const imagesResponse = await fetch(`/api/projects/${projectId}/images`, {
                credentials: 'include',
            });

            if (imagesResponse.ok) {
                const imagesData = await imagesResponse.json();
                setImages(imagesData);
            }

            // Fetch assignments
            const assignmentsResponse = await fetch(`/api/projects/${projectId}/assignments`, {
                credentials: 'include',
            });

            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json();
                setAssignments(assignmentsData);
            }

            // Fetch all annotators
            const annotatorsResponse = await fetch('/api/users', {
                credentials: 'include',
            });

            if (annotatorsResponse.ok) {
                const annotatorsData = await annotatorsResponse.json();
                setAvailableAnnotators(annotatorsData);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setLocation('/specialist/dashboard');
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setLocation('/login');
    };

    const handleAddLabel = async () => {
        if (!newLabelName.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a label name',
                variant: 'destructive',
            });
            return;
        }

        setIsAddingLabel(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/labels`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newLabelName,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add label');
            }

            const newLabel = await response.json();
            setLabels([...labels, newLabel]);
            setNewLabelName('');
            setIsLabelDialogOpen(false);

            toast({
                title: 'Success',
                description: 'Label added successfully',
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to add label',
                variant: 'destructive',
            });
        } finally {
            setIsAddingLabel(false);
        }
    };

    const handleDeleteLabel = async (labelId: string) => {
        if (!confirm('Are you sure you want to delete this label?')) {
            return;
        }

        try {
            const response = await fetch(`/api/labels/${labelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete label');
            }

            setLabels(labels.filter(l => l.id !== labelId));

            toast({
                title: 'Success',
                description: 'Label deleted successfully',
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to delete label',
                variant: 'destructive',
            });
        }
    };

    const handleAddImage = async () => {
        if (!imageUrl.trim() || !imageFilename.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter both URL and filename',
                variant: 'destructive',
            });
            return;
        }

        setIsAddingImage(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/images`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: imageFilename,
                    url: imageUrl,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add image');
            }

            const newImage = await response.json();
            setImages([...images, newImage]);
            setImageUrl('');
            setImageFilename('');
            setIsImageDialogOpen(false);

            toast({
                title: 'Success',
                description: 'Image added successfully',
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to add image',
                variant: 'destructive',
            });
        } finally {
            setIsAddingImage(false);
        }
    };

    const handleAssignAnnotator = async () => {
        if (!selectedAnnotatorId) {
            toast({
                title: 'Error',
                description: 'Please select an annotator',
                variant: 'destructive',
            });
            return;
        }

        setIsAssigningUser(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/assign`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedAnnotatorId,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to assign annotator');
            }

            const newAssignment = await response.json();

            // Find the user details
            const assignedUser = availableAnnotators.find(u => u.id === selectedAnnotatorId);

            setAssignments([
                ...assignments,
                {
                    ...newAssignment,
                    user: assignedUser ? {
                        id: assignedUser.id,
                        name: assignedUser.name,
                        email: assignedUser.email,
                    } : undefined,
                },
            ]);

            setSelectedAnnotatorId('');
            setIsAssignDialogOpen(false);

            toast({
                title: 'Success',
                description: 'Annotator assigned successfully',
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to assign annotator',
                variant: 'destructive',
            });
        } finally {
            setIsAssigningUser(false);
        }
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Filter out already assigned annotators
    const unassignedAnnotators = availableAnnotators.filter(
        annotator => !assignments.some(a => a.userId === annotator.id)
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-primary-foreground" />
                                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold">VT-Annotator</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Hello</span>
                            <span className="text-sm font-medium">{user?.name}</span>
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {user ? getUserInitials(user.name) : 'DS'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            data-testid="button-logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Back Button & Title */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="gap-2"
                            data-testid="button-back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Projects
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Project Header */}
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project?.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {project?.description || 'No description'}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription className="text-sm font-medium">Labels</CardDescription>
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{labels.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription className="text-sm font-medium">Images</CardDescription>
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{images.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardDescription className="text-sm font-medium">Annotators</CardDescription>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{assignments.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="labels" className="w-full">
                        <TabsList>
                            <TabsTrigger value="labels">Labels</TabsTrigger>
                            <TabsTrigger value="images">Images</TabsTrigger>
                            <TabsTrigger value="annotators">Annotators</TabsTrigger>
                        </TabsList>

                        {/* Labels Tab */}
                        <TabsContent value="labels" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Project Labels</h3>
                                <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2" data-testid="button-add-label">
                                            <Plus className="w-4 h-4" />
                                            Add Label
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Label</DialogTitle>
                                            <DialogDescription>
                                                Create a new label for this project
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="label-name">Label Name</Label>
                                                <Input
                                                    id="label-name"
                                                    placeholder="e.g., Border Collie"
                                                    value={newLabelName}
                                                    onChange={(e) => setNewLabelName(e.target.value)}
                                                    disabled={isAddingLabel}
                                                    data-testid="input-label-name"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsLabelDialogOpen(false)}
                                                disabled={isAddingLabel}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddLabel}
                                                disabled={isAddingLabel}
                                                data-testid="button-create-label"
                                            >
                                                {isAddingLabel ? 'Adding...' : 'Add Label'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {labels.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <CardContent>
                                        <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-medium mb-2">No labels yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Add labels to categorize your images
                                        </p>
                                        <Button onClick={() => setIsLabelDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Label
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {labels.map((label) => (
                                        <Card key={label.id} data-testid={`card-label-${label.id}`}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{label.name}</CardTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteLabel(label.id)}
                                                        data-testid={`button-delete-label-${label.id}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Images Tab */}
                        <TabsContent value="images" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Project Images</h3>
                                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2" data-testid="button-add-image">
                                            <Upload className="w-4 h-4" />
                                            Upload Images
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Upload Images</DialogTitle>
                                            <DialogDescription>
                                                Upload images from your local machine or from a URL.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ImageUploadDialog
                                            projectId={projectId}
                                            onUploadComplete={() => {
                                                setIsImageDialogOpen(false);
                                                loadData();
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {images.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <CardContent>
                                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-medium mb-2">No images yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Add images to start annotating
                                        </p>
                                        <Button onClick={() => setIsImageDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Image
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {images.map((image) => (
                                        <Card key={image.id} data-testid={`card-image-${image.id}`}>
                                            <CardContent className="p-4">
                                                <img
                                                    src={image.url}
                                                    alt={image.filename}
                                                    className="w-full h-48 object-cover rounded-lg mb-2"
                                                />
                                                <p className="text-sm font-medium truncate">{image.filename}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Annotators Tab */}
                        <TabsContent value="annotators" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold">Assigned Annotators</h3>
                                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2" data-testid="button-assign-annotator">
                                            <Plus className="w-4 h-4" />
                                            Assign Annotator
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Assign Annotator</DialogTitle>
                                            <DialogDescription>
                                                Select an annotator to assign to this project
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="annotator-select">Select Annotator</Label>
                                                <Select
                                                    value={selectedAnnotatorId}
                                                    onValueChange={setSelectedAnnotatorId}
                                                    disabled={isAssigningUser}
                                                >
                                                    <SelectTrigger id="annotator-select" data-testid="select-annotator">
                                                        <SelectValue placeholder="Choose an annotator" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {unassignedAnnotators.length === 0 ? (
                                                            <div className="p-2 text-sm text-muted-foreground">
                                                                No available annotators
                                                            </div>
                                                        ) : (
                                                            unassignedAnnotators.map((annotator) => (
                                                                <SelectItem
                                                                    key={annotator.id}
                                                                    value={annotator.id}
                                                                    data-testid={`select-item-${annotator.id}`}
                                                                >
                                                                    {annotator.name} ({annotator.email})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAssignDialogOpen(false)}
                                                disabled={isAssigningUser}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAssignAnnotator}
                                                disabled={isAssigningUser || !selectedAnnotatorId}
                                                data-testid="button-confirm-assign"
                                            >
                                                {isAssigningUser ? 'Assigning...' : 'Assign'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {assignments.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <CardContent>
                                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-medium mb-2">No annotators assigned</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Assign annotators to start the annotation process
                                        </p>
                                        <Button onClick={() => setIsAssignDialogOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Assign Annotator
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <Card key={assignment.id} data-testid={`card-assignment-${assignment.id}`}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                                {assignment.user ? getUserInitials(assignment.user.name) : '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                {assignment.user?.name || 'Unknown'}
                                                            </CardTitle>
                                                            <CardDescription className="text-sm">
                                                                {assignment.user?.email || 'No email'}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Sign out */}
            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={handleLogout}
                        className="text-sm text-muted-foreground hover:text-foreground"
                        data-testid="link-sign-out"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}