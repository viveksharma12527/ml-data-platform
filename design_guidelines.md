# VT-Annotator Platform Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern SaaS dashboards (Linear, Notion) and data annotation platforms (Labelbox, Scale AI), combined with the tech-inspired aesthetic shown in the provided Figma designs. The platform balances professional data tooling with approachable UI for annotators.

## Core Design Principles
1. **Tech-Forward Professionalism**: Hexagonal patterns and geometric shapes establish a technical, cutting-edge feel
2. **Role-Aware Interfaces**: Annotator views prioritize simplicity and focus; Data Specialist views emphasize control and configuration
3. **Split-Screen Storytelling**: Authentication pages use compelling visual narratives

---

## Typography System

**Font Families** (via Google Fonts):
- Primary: Inter (400, 500, 600, 700) - UI elements, body text, navigation
- Accent: Space Grotesk (500, 600) - Headlines, section titles, branding

**Type Scale**:
- H1 (Page Titles): text-4xl md:text-5xl, font-bold, Space Grotesk
- H2 (Section Headers): text-2xl md:text-3xl, font-semibold, Space Grotesk  
- H3 (Card Titles): text-lg md:text-xl, font-semibold, Inter
- Body Large: text-base, font-normal, Inter
- Body: text-sm, font-normal, Inter
- Small/Meta: text-xs, font-medium, Inter
- Buttons: text-sm, font-semibold, Inter

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (elements within components): p-2, gap-2, space-y-2
- Component padding: p-4, p-6  
- Section spacing: py-8, py-12, py-16
- Page margins: px-4 md:px-6 lg:px-8
- Card spacing: p-6 lg:p-8
- Dashboard content gaps: gap-6, gap-8

**Container Strategy**:
- Auth pages: Full viewport split (50/50 on desktop, stacked mobile)
- Dashboard max-width: max-w-7xl mx-auto
- Content cards: Full width within container with gap-6 grid
- Forms: max-w-md for focused input experiences

---

## Component Library

### Authentication Pages (Register/Login)

**Layout**: Split-screen design (lg:grid-cols-2)
- Left panel: Form container (max-w-md, centered vertically)
- Right panel: Tech graphics with hexagonal patterns, Visage Technologies branding, tagline

**Form Structure**:
- Logo/branding at top (h-12)
- Page title (text-3xl, Space Grotesk, mb-2)
- Subtitle text (text-sm, mb-8)
- Input fields with consistent spacing (space-y-4)
- Primary CTA button (w-full, py-3, rounded-lg)
- Footer link for alternate action (text-center, mt-6)

**Input Fields**:
- Label above input (text-sm, font-medium, mb-2)
- Input height: h-12
- Border radius: rounded-lg
- Icon prefix for email/password fields
- Role selector: Custom dropdown/radio buttons with visual hierarchy

### Dashboard Layouts

**Navigation Header**:
- Fixed top position with backdrop blur
- Height: h-16
- Logo left, navigation center, profile/logout right
- Subtle bottom border for separation

**Main Dashboard Grid**:
- Two-column on desktop (lg:grid-cols-3 with 2:1 ratio for primary/sidebar)
- Single column mobile
- Consistent gap-6 between cards

**Dashboard Cards**:
- Elevated appearance with subtle shadow
- Rounded corners: rounded-xl
- Padding: p-6 lg:p-8
- Header with title + action button
- Content area with appropriate spacing

### Annotator Dashboard

**Welcome Section**:
- Large greeting (text-2xl, font-semibold)
- Stats row with icon + number + label (grid-cols-2 md:grid-cols-4, gap-4)

**Project Cards Grid**:
- grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each card shows: Project name, progress bar, images remaining, "Start Annotation" button
- Progress bar: h-2, rounded-full with fill indicator

**Annotation Interface**:
- Full-screen modal/dedicated page
- Image display: Centered, max-h-[70vh], maintain aspect ratio
- Label selection: Horizontal button group or grid below image
- Navigation: Previous/Next buttons fixed bottom (gap-4)
- Progress indicator: Top bar showing X of Y images

### Data Specialist Dashboard

**Action Bar**:
- Horizontal layout with primary actions (Upload Images, Create Project)
- Icons + text for each action
- gap-4 between action buttons

**Upload Section**:
- Drag-and-drop zone: Dashed border, rounded-xl, p-12, hover state
- File list: Table-style with filename, size, preview icon, remove action
- Preview thumbnails: Grid layout when files selected

**Project Creation Form**:
- Modal overlay or slide-in panel
- Form sections with clear separation (space-y-6)
- Project name input
- Label management: Add/remove chips interface
- Image assignment: Checkbox list or multi-select
- Action buttons: Cancel (secondary) + Create (primary) at bottom

**Projects Table**:
- Full-width table with columns: Name, Labels, Images, Annotators, Progress, Status, Actions
- Row height: h-14
- Alternating row treatment for readability
- Status badges: Pill-shaped, appropriate sizing
- Actions: Icon buttons (edit, delete, view)

### Label Management UI

**Label Input**:
- Inline add form: Input + "Add Label" button in single row
- Tag/chip display for existing labels with remove icon
- Wrap labels in flex container with gap-2

---

## Interactive Elements

**Buttons**:
- Primary: py-3 px-6, rounded-lg, font-semibold
- Secondary: Same sizing, outlined style
- Icon buttons: w-10 h-10, rounded-lg, centered icon
- Disabled state: Reduced opacity

**Form Inputs**:
- Height: h-12
- Padding: px-4
- Border radius: rounded-lg
- Focus: Visible outline with offset

**Cards**: 
- Hover: Subtle elevation increase
- Active states for clickable cards

---

## Images & Graphics

**Hero/Auth Graphics** (Right Panel):
- Hexagonal tech pattern background
- Visage Technologies logo (h-8 to h-12)
- Tagline: "Advanced Image Annotation Platform" or "Precision Data Labeling"
- Abstract tech illustrations or data visualization graphics

**Dashboard Icons**:
- Use Heroicons (outline style for navigation, solid for emphasis)
- Size: w-5 h-5 for inline, w-6 h-6 for standalone
- Annotation labels can use emoji or icon indicators

**Sample Images** (for annotation):
- Display with object-contain to maintain aspect ratio
- Center aligned with max-height constraints
- Loading skeleton while images load

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Stack all columns, full-width cards
- Tablet (md): 2-column grids, side-by-side forms
- Desktop (lg+): Full multi-column layouts, split screens

**Navigation**: 
- Mobile: Hamburger menu
- Desktop: Full horizontal nav

**Dashboard**:
- Mobile: Single column cards, scrollable tables
- Desktop: Multi-column grids, full tables

---

This design system creates a professional, tech-forward annotation platform that balances powerful data tooling with intuitive user experiences across both annotator and data specialist workflows.