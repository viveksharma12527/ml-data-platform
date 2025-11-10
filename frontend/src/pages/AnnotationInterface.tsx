import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, LogOut } from 'lucide-react';

// todo: remove mock functionality
const mockLabels = {
  '1': ['Border Collie', 'Golden Retriever', 'Labrador', 'Dalmatian'],
  '2': ['Toyota', 'Honda', 'Ford', 'BMW'],
  '3': ['Tennis Racket', 'Badminton Racket', 'Squash Racket'],
  '4': ['Eagle', 'Sparrow', 'Parrot', 'Owl'],
};

const mockImages = {
  '1': 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&auto=format&fit=crop',
  '2': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop',
  '3': 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&auto=format&fit=crop',
  '4': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop',
};

export default function AnnotationInterface() {
  const params = useParams();
  const projectId = params.id || '1';
  const [, setLocation] = useLocation();
  const [currentImage, setCurrentImage] = useState(45);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const totalImages = 100;

  const labels = mockLabels[projectId as keyof typeof mockLabels] || mockLabels['1'];
  const imageUrl = mockImages[projectId as keyof typeof mockImages] || mockImages['1'];

  const handleBack = () => {
    setLocation('/annotator/dashboard');
  };

  const handleLabelSelect = (label: string) => {
    console.log('Label selected:', label);
    setSelectedLabel(label);
  };

  const handleSaveAndNext = () => {
    if (!selectedLabel) return;
    console.log('Saving annotation:', { image: currentImage, label: selectedLabel });
    
    if (currentImage < totalImages) {
      setCurrentImage(currentImage + 1);
      setSelectedLabel(null);
    } else {
      alert('Annotation complete!');
      setLocation('/annotator/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentImage > 1) {
      setCurrentImage(currentImage - 1);
      setSelectedLabel(null);
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Unsaved progress will be lost.')) {
      setLocation('/annotator/dashboard');
    }
  };

  const handleLogout = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              <span className="text-sm font-medium">LeaBorderCollie</span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">LC</AvatarFallback>
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

      {/* Sidebar & Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">My profile</h2>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={handleBack}
              data-testid="button-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start mt-2"
              data-testid="button-my-projects"
            >
              My projects
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Title & Progress */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dog Breed Classification</h1>
                <div className="text-sm text-muted-foreground" data-testid="text-progress">
                  Image {currentImage} of {totalImages}
                </div>
              </div>

              {/* Image Display */}
              <Card className="p-8">
                <div className="flex items-center justify-center bg-muted rounded-lg" style={{ minHeight: '400px' }}>
                  <img 
                    src={imageUrl}
                    alt="Image to annotate"
                    className="max-h-[500px] max-w-full object-contain rounded-lg"
                    data-testid="img-annotation"
                  />
                </div>
              </Card>

              {/* Label Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Label</h3>
                <div className="grid grid-cols-2 gap-4">
                  {labels.map((label) => (
                    <Button
                      key={label}
                      variant={selectedLabel === label ? 'default' : 'outline'}
                      className="h-auto py-4 text-base"
                      onClick={() => handleLabelSelect(label)}
                      data-testid={`button-label-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <Button 
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentImage === 1}
                  data-testid="button-back"
                >
                  Back
                </Button>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={handleSaveAndNext}
                    disabled={!selectedLabel}
                    data-testid="button-save-next"
                  >
                    Save and Next
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleExit}
                    data-testid="button-exit"
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sign out */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground"
          data-testid="link-sign-out"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
