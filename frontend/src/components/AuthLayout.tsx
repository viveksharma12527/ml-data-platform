import heroImage from '@assets/generated_images/Tech_hero_background_hexagons_1830f53c.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex items-center justify-center p-4 md:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-primary-foreground" />
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold">Visage Technologies</div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <div>{children}</div>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] relative overflow-hidden">
        <img 
          src={heroImage} 
          alt="Technology Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-white" />
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to<br />VT-Annotator
          </h2>
          <p className="text-lg text-white/90 max-w-md mx-auto">
            Advanced Image Annotation Platform for Precision Data Labeling
          </p>
        </div>
      </div>
    </div>
  );
}
