# AI Recipe Generator

## Overview

This is a full-stack AI-powered recipe generation application built with React, Express.js, and PostgreSQL. The application allows users to input available ingredients and generates creative recipe suggestions using OpenAI's GPT model. Users can save recipes locally and view their saved collection. The frontend uses a modern component-based architecture with shadcn/ui components, while the backend provides RESTful APIs for recipe generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Local Storage**: Custom hook for persisting saved recipes and user preferences
- **Component Structure**: Modular component architecture with reusable UI components in `/components/ui/`

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with `/api/recipes/generate` endpoint
- **Storage Strategy**: In-memory storage implementation with interface for future database integration
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development Server**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Schema Management**: Shared schema definitions between frontend and backend
- **Migration System**: Drizzle Kit for database migrations
- **Current Implementation**: Memory storage for development with database schema ready for production

### Authentication and Authorization
- **Current State**: No authentication implemented
- **Prepared Infrastructure**: User schema defined in database for future implementation
- **Session Management**: connect-pg-simple package available for PostgreSQL session storage

## External Dependencies

### AI Service Integration
- **OpenAI API**: GPT-5 model for recipe generation
- **API Key Management**: Environment variable configuration
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### Database Services
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Environment-based database URL configuration
- **ORM**: Drizzle ORM with type-safe database operations

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for enhanced UI

### Development Tools
- **Replit Integration**: Vite plugins for Replit-specific development features
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Frontend Utilities
- **Class Variance Authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional CSS class handling
- **date-fns**: Date manipulation and formatting
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema parsing

The application is designed with a clean separation of concerns, making it easy to extend with additional features like user authentication, recipe sharing, and advanced filtering capabilities.