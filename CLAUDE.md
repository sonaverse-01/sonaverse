# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build production version  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

This is a Next.js 15 application using the App Router with TypeScript and MongoDB. The project is a bilingual (Korean/English) corporate website for SONAVERSE with a comprehensive admin CMS.

### Core Structure
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API routes with MongoDB Atlas via Mongoose
- **Auth**: JWT-based authentication with httpOnly cookies
- **Storage**: Vercel Blob for file uploads
- **i18n**: next-i18next for Korean/English support

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components  
- `src/lib/` - Utility functions (db, auth, cache, email)
- `src/models/` - Mongoose schemas for MongoDB
- `public/locales/` - Translation files (ko/en)

## Database Models

All models use Mongoose ODM with multilingual content stored as objects:
- `AdminUser` - Admin authentication
- `BlogPost` - Blog content with rich text editor
- `Product` - Product information  
- `PressRelease` - Press releases
- `Page` - Dynamic pages
- `Inquiry` - Contact form submissions
- `SonaverseStory` - Company story content
- `AdminSetting` - Site configuration

## Admin System

The admin panel (`/admin`) uses JWT authentication with:
- Rich text editor (TipTap) for content management
- Image upload via Vercel Blob
- CRUD operations for all content types
- Role-based access control

### Key Admin Components
- `TiptapEditor` - Rich text editing with dynamic import
- `ImageUpload` - Vercel Blob integration
- `AdminSidebar` - Navigation component
- `AuthManager` - Client-side auth state management

## Authentication Flow

1. Login via `/api/auth/login` sets httpOnly cookie
2. Middleware checks auth for protected routes
3. `getCurrentUser()` from `src/lib/auth.ts` validates sessions
4. Client-side auth state managed by `AuthManager`

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB Atlas connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token  
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_SITE_URL` - Site URL for emails

## Internationalization

- Default language: Korean (`ko`)
- Supported: Korean, English
- Files: `/public/locales/{lang}/common.json`
- Usage: `useTranslation()` hook from react-i18next
- Database: Multilingual fields stored as `{ko: string, en: string}`

## Security Features

- Security headers configured in `vercel.json`
- CSRF protection via SameSite cookies
- XSS protection headers
- Content Security Policy headers
- Admin routes cached disabled

## Common Development Patterns

1. **API Routes**: Use `dbConnect()` before database operations
2. **Auth Protected Routes**: Use `getCurrentUser()` for server-side auth
3. **Multilingual Content**: Always provide both `ko` and `en` fields
4. **Image Handling**: Use `ImageUpload` component for Vercel Blob
5. **Rich Text**: Use `TiptapEditorDynamic` with dynamic imports