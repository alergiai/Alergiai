# Alergi.AI - Food Safety Scanner

## Overview
Alergi.AI is a mobile-first web application that uses AI to scan food packaging and identify allergens, intolerances, and dietary restrictions based on user preferences. The app provides real-time ingredient analysis with safety recommendations and maintains a comprehensive history of scans.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for bundling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: React hooks and localStorage for persistence
- **Animations**: Framer Motion for UI transitions
- **Database ORM**: Drizzle with PostgreSQL schema (configured but not fully implemented)
- **Backend**: Express.js server
- **AI Integration**: OpenAI GPT-4 Vision API for image analysis
- **Camera**: React Webcam for image capture

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express server
│   ├── services/           # Business logic (OpenAI integration)
│   └── routes.ts           # API endpoints
├── shared/                 # Shared types and schema
└── migrations/             # Database migrations
```

## Key Components

### Frontend Architecture
- **Single Page Application**: Uses wouter for client-side routing
- **Component-based Design**: Modular components with shadcn/ui design system
- **Responsive Mobile-first**: Tailored for mobile camera usage
- **Progressive Enhancement**: File upload fallback for camera functionality

### Backend Architecture
- **RESTful API**: Express.js server with JSON endpoints
- **Image Processing**: Handles base64 image data up to 50MB
- **AI Integration**: OpenAI GPT-4 Vision for ingredient analysis
- **Error Handling**: Comprehensive error responses and logging

### Data Storage
- **Client-side Storage**: localStorage for user preferences and scan history
- **Database Ready**: Drizzle ORM configured for PostgreSQL (schema defined but not fully utilized)
- **History Management**: Stores up to 100 scans with thumbnail previews

### User Experience Flow
1. **Onboarding**: 7-step guided setup for allergen preferences
2. **Camera Scanning**: Real-time camera feed or file upload
3. **AI Analysis**: Image sent to OpenAI for ingredient detection
4. **Results Display**: Safety assessment with detailed allergen information
5. **History Tracking**: Persistent storage of scan results

## Data Flow

### Scan Process
1. User captures/uploads food packaging image
2. Frontend converts image to base64 format
3. Image data sent to `/api/analyze` endpoint with user allergens
4. Server processes request through OpenAI GPT-4 Vision API
5. AI analyzes ingredients against user's allergen profile
6. Results returned with safety assessment and recommendations
7. Frontend displays results and saves to localStorage history

### Allergen Management
- Predefined categories: Common allergens, dietary restrictions, religious/ethical restrictions
- Custom allergen support with user-defined entries
- Real-time filtering and selection interface
- Persistent storage of user preferences

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4 Vision model for image analysis
- **Webcam Access**: Browser camera API for image capture
- **PostgreSQL**: Database backend (configured but optional)

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized static assets
- Backend: ESBuild creates single-file Node.js bundle
- Assets: Served from `dist/public` directory

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Express serves static files and API routes
- **Database**: Optional PostgreSQL connection via DATABASE_URL

### Deployment Targets
- **Replit**: Configured for Replit deployment with autoscale
- **Port Configuration**: Internal port 5000, external port 80
- **Process Management**: npm scripts for dev/build/start lifecycle

## Changelog
- June 24, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.