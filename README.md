# Karolina Admin Panel

A modern, responsive React admin panel built with shadcn/ui and Tailwind CSS, featuring Apple-like design principles.

## Features

- **Dual Authentication System**: Separate login flows for Admin and Influencer
- **Apple-inspired Design**: Clean, minimal, and elegant UI
- **Mobile Responsive**: Fully optimized for all device sizes
- **Modern Stack**: React, TypeScript, Vite, shadcn/ui, and Tailwind CSS

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
  ├── components/
  │   └── ui/          # shadcn/ui components
  ├── lib/
  │   └── utils.ts     # Utility functions
  ├── pages/
  │   └── AuthPage.tsx # Authentication page
  ├── App.tsx          # Main app component
  └── main.tsx         # Entry point
```

## Authentication

### Admin Login
- Email and password required
- Full access to admin dashboard

### Influencer Login
- Email only (passwordless for now)
- Access to influencer portal

