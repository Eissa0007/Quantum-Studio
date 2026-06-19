# Quantum Studio v0.9.0-beta - Technical Specification

## 1. PROJECT OVERVIEW
**Purpose and Goal**: Quantum Studio is a browser-based collaborative graphic design and prototyping platform. Its primary goal is to combine AI-enhanced creation tools, real-time collaboration, and advanced canvas manipulation within a single cohesive environment, eliminating the need to switch between specialized tools.
**Target Audience**: Designers, marketers, developers, and collaborative teams seeking an all-in-one, AI-powered design and prototyping workspace.
**Problem Solved**: Streamlines fragmented design workflows by merging traditional canvas-based design with multi-modal AI generation (text, image, and layout) and real-time collaboration capabilities.
**Current Status**: Core MVP complete (Version 0.9.0-beta / Pre-release). Real-time collaboration and mobile responsiveness are in active development.

## 2. TECHNICAL STACK
- **Frontend Framework**: React 19.0.1 with TypeScript 5.x
- **Backend Technology**: Node.js 20.x with Express 4.21.2 routing layer
- **Database**: Primary: Supabase 2.108.2 (PostgreSQL + Realtime subscriptions) | Secondary: Firebase 12.15.0 (NoSQL flexible schema)
- **Third-party APIs**: Google Gemini 2.4.0 (Multimodal AI Engine), Pexels, Pixabay, Unsplash (Asset Ecosystem)
- **Hosting/Deployment**: Google Cloud Run / Google AI Studio infrastructure
- **Key Dependencies**: 
  - Build: Vite 6.2.3
  - Styling: Tailwind CSS 4.1.14
  - State: Zustand 5.0.14
  - Canvas: Fabric.js 7.4.0 (2D), Three.js 0.184.0 (3D WebGL)
  - Animation: motion (Framer Motion) 12.23.24
  - ML/Vision: @imgly/background-removal (latest)
  - Storage: idb-keyval (offline caching layer)

## 3. FEATURES & FUNCTIONALITY
- **AI-Powered Design Assistance**: Context-aware recommendations, Magic Write (copy generation), Text-to-image generation with Direct Canvas Injection, and client-side background removal without server roundtrips.
- **Advanced Canvas Engine**: Full object manipulation (scale, rotate, skew, group), z-index layer ordering, exact locking/visibility toggling, and multi-format export pipeline (PNG, JPG, SVG, JSON).
- **Real-Time Collaboration (Beta)**: Supabase Realtime channel architecture, cursor position broadcasting, presence state management, and basic Last-Write-Wins conflict resolution.
- **Asset Ecosystem**: Direct search-to-canvas integration for Pexels, Pixabay, Unsplash, and customizable SVG template libraries.
- **History System**: 100-state snapshot tree with timestamped logging and undo/redo functionality.
- **User Authentication**: Supabase Auth handles login, signup, and roles (AdminGuard middleware).
- **Payment/Subscription**: E-commerce structures prepared via `QuantumStorePanel` for future monetization.
- **Admin Panel**: Dashboard metrics including user growth, template utilization, and storage tracking.
- **Standout Features**: Seamless integration of intelligent generation APIs within the native graphic workspace.

## 4. USER FLOW & PAGES
**Main Screens**: 
- Central Canvas View (The Workspace)
- Sidebar Panels: Projects, Uploads, Templates, Elements, Text, Apps (Plugin Store), Brands, Admin Dashboard, History Timeline.
**User Journey**: Users land on the canvas -> Authenticate via Supabase -> Use sidebar elements to drop shapes/media -> Utilize the AI Assistant for intelligent generation -> Manipulate the layout on the canvas -> Collaborate in real-time -> Export the final project.
**User Roles**: Guest, Authenticated User, and Administrator.
**Navigation Structure**: 
- Desktop: Persistent left navigation rail triggering right-side drawer panels.
- Mobile: Collapsible bottom navigation bar with full-screen sliding drawers.
- **Onboarding**: Simple, localized (Arabic/English) step-by-step introduction modal upon first load.

## 5. SYSTEM REQUIREMENTS & SETUP
**Minimum Requirements**: Modern browser (Chrome/Edge/Safari/Firefox), Node.js >= 20.0.0, npm >= 10.0.0
**Installation Guide**:
1. Clone the repository and run `npm install`.
2. Configure environment variables in `.env`.
3. Start the development server using `npm run dev`.
4. Build for production using `npm run build && npm run start`.
**Required Environment Variables**:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `VITE_PEXELS_API_KEY`, `VITE_PIXABAY_API_KEY`, `VITE_UNSPLASH_API_KEY` (Optional)
**Fallback Setup**: Mock-demo mode activates when critical keys are absent.
**Known Limitations**: 
- Fabric.js pinch-to-zoom conflicts occasionally with native mobile browser gestures.
- Performance ceilings on extremely large layouts due to lack of off-screen WebGL canvas chunking.

## 6. DATA & SECURITY
- **User Data Collected**: User profiles (id, email, metadata), created design projects, uploaded assets, and action history.
- **Security Measures**: Authentication via Supabase Auth (PKCE flow), Authorization via Row-Level Security (RLS) policies on all tables, TLS 1.3 in-transit encryption, AES-256 at-rest encryption managed by Supabase.
- **Privacy Compliance**: GDPR deletion workflows and cookie banners are planned but not yet implemented (Not Available yet).
- **Data Backup Strategy**: Off-shore redundancy handled by Supabase infrastructure. Client-side offline storage via `idb-keyval` provides resilience against network drops.
- **Rate Limits**: Rate restrictions are currently delegated to upstream third-party APIs rather than a custom gateway.

## 7. DESIGN & UI/UX
- **Design Framework**: Tailwind CSS utilizing custom design tokens for highly bespoke styling (no Material UI/Bootstrap).
- **Color Scheme & Branding**: "Quantum" theme focusing on deep dark palettes (`#1A1A2E`, `#0F1419`) illuminated by electric cyan (`#00C4CC`) and vibrant accents.
- **Responsive Design**: Fluid mobile-first grid mapping. Transitions from stacked bottom-navigation on mobile (`< 768px`) to persistent side-rails on desktop.
- **Animations**: Driven by Framer Motion for gesture-responsive interactions, layout transitions, and entrance sequences.
- **Dark/Light Mode**: Full system-aware theming overrides available.

## 8. TESTING & QUALITY
- **Automated Tests**: Not Available. (Unit, Integration, and E2E test suites are planned but not currently configured in the beta).
- **Testing Frameworks**: Not Available. (Jest/Vitest integration pending).
- **Staging Environment**: Google Cloud Run shared app deployment utilizing isolated preview builds.
- **Code Quality**: Basic TypeScript typing enforcement. Comprehensive ESLint strict standard configuration is absent.
- **Performance Benchmarks**: Not natively available. Stress tests show degraded frame rates at >2,500 active SVG objects pending chunking optimization.

## 9. DOCUMENTATION & SUPPORT
- **Available Documentation**: This `TECHNICAL_SPEC.md` serves as the primary system design record. Extensive component-level and hooks comments are maintained directly in code.
- **Support Channels**: Internal development channels via AI Studio. Public user-facing helpdesks and manuals are pending v1.0.0.
- **Video Tutorials**: Not Available.
- **Changelog**: Maintained via git commit history.

## 10. FUTURE ROADMAP
- **Q3 2026**: 
  - Integrate Operational Transformation (OT) or CRDT models (e.g., Yjs) to solve Last-Write-Wins collaboration concurrency issues.
  - Implement canvas chunking and off-screen WebGL culling for performance.
- **Q4 2026**: 
  - Finalize mobile multi-touch gesture mapping (pinch-to-zoom fixes).
  - Complete WCAG 2.1 AA accessibility compliance audit and remediation.
- **Q1 2027**: 
  - Production readiness assessment and complete security hardening.
  - Integrate payment/subscription gateways for premium AI credits, advanced templates, and cloud storage.
  - Resolve known UI and touch interaction bugs on mobile Safari.
