
# Development Guide

This guide covers the setup and development process for the time tracking application.

## Environment Setup

1. **Configure Supabase Client**
   Update the environment variables in your project:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Start Development Server**
   ```sh
   npm run dev
   ```

## Project Structure

- `/src`: Source code
  - `/components`: React components
  - `/pages`: Page components
  - `/hooks`: Custom React hooks
  - `/utils`: Utility functions
  - `/integrations`: Third-party integrations

## Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run tests
- `npm run lint`: Run linter

## Code Style

- Use TypeScript for type safety
- Follow the existing code style
- Use Prettier for code formatting
- Use ESLint for code linting
