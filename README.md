# Stride

A modern, minimalistic to-do tracker with progress percentages, subtask management, and celebration animations.

![Stride App](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-teal?style=flat-square&logo=tailwindcss)

## ✨ Features

### 🎯 Core Functionality

- **Smart Progress Tracking** - Automatic calculation based on subtask completion
- **Flexible Task Creation** - Support for both simple tasks and complex projects with subtasks
- **Intelligent Grouping** - Auto-categorization by deadlines (Today, This Week, This Month, Later)
- **Inline Editing** - Click-to-edit titles and time estimates
- **Celebration System** - Confetti animations for completed tasks with loop prevention

### 🎨 Design & UX

- **Grayscale-Only UI** - Clean, professional aesthetic with no distracting colors
- **Light/Dark Themes** - Seamless theme switching with preference persistence
- **No Modal Interruptions** - Inline creation and editing for smooth workflow
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Minimal Typography** - Clean, readable interface with Geist font family

### 🔧 Technical Excellence

- **Local Data Persistence** - All data saved locally with robust date handling
- **Type-Safe Development** - Full TypeScript coverage
- **Performance Optimized** - Efficient re-renders with React hooks optimization
- **Accessibility Ready** - Proper form controls and keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stride
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📱 Usage Guide

### Creating Your First Tracker

1. Click **"+ Create a new tracker"** to expand the creation form
2. Enter a **title** (required) and optional **description**
3. Set **time estimate** in minutes (default: 30)
4. Add optional **deadline** using the datetime picker
5. Create **subtasks** for complex projects (optional)
6. Click **"Create"** to add your tracker

### Managing Trackers

#### ✅ Completing Tasks

- **Simple Tasks**: Check the main checkbox → instant 100% progress → confetti celebration
- **Tasks with Subtasks**: Check individual subtasks to update progress automatically
- **Bulk Complete**: Use main checkbox to mark all subtasks complete at once

#### ✏️ Editing

- **Title**: Click on any tracker title to edit inline
- **Time Estimate**: Click on the time value to adjust
- **Subtasks**: Check/uncheck to update progress

#### 🗑️ Deleting

- Click the **×** button → click **"Confirm"** to permanently delete

### Organization Features

#### 📅 Smart Grouping

Trackers are automatically organized by deadline:

- **Today** - Due within 24 hours
- **This Week** - Due within current week
- **This Month** - Due within current month
- **Later** - No deadline or future dates

#### 🔄 Sorting Options

- **Created Date** - Most recent first (default)
- **Deadline** - Earliest deadline first
- **Progress** - Highest completion first

### Theme Customization

Toggle between light and dark modes using the button in the top-right corner. Your preference is automatically saved.

## 🏗️ Technical Architecture

### Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with CSS Variables
- **Animation**: react-confetti
- **Fonts**: Geist Sans & Geist Mono

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme setup
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles & CSS variables
├── components/
│   ├── ConfettiCelebration.tsx  # Success animations
│   ├── InlineCreate.tsx         # Tracker creation form
│   ├── ProgressBar.tsx          # Visual progress indicator
│   ├── SortControls.tsx         # Sorting interface
│   ├── ThemeToggle.tsx          # Light/dark mode switch
│   └── TrackerCard.tsx          # Individual tracker display
├── hooks/
│   ├── useLocalStorage.ts       # Persistent state management
│   └── useTrackers.ts           # Core business logic
└── types/
    └── tracker.ts               # TypeScript interfaces
```

### Data Model

```typescript
interface Tracker {
  id: string; // Unique identifier
  title: string; // Task name
  description: string; // Optional details
  timeEstimate: number; // Estimated minutes
  deadline?: Date; // Optional due date
  subtasks: Subtask[]; // Sub-items array
  createdAt: Date; // Creation timestamp
  progress: number; // 0-100 completion percentage
  completed: boolean; // Main task status
  celebrated?: boolean; // Prevents duplicate celebrations
}

interface Subtask {
  id: string; // Unique identifier
  text: string; // Subtask description
  completed: boolean; // Completion status
}
```

### State Management

The application uses custom React hooks for state management:

- **`useLocalStorage`** - Handles persistence with automatic date serialization
- **`useTrackers`** - Core business logic including CRUD operations, progress calculation, and grouping

### Theme System

Built with CSS custom properties for seamless theme switching:

```css
/* Light Theme */
--background: #ffffff
--foreground: #111111
--muted: #6b7280
--border: #e5e7eb
--surface: #f9fafb

/* Dark Theme */
--background: #000000
--foreground: #e5e7eb
--muted: #9ca3af
--border: #1f2937
--surface: #0b0b0b
```

## 🎨 Design Principles

### Minimalism First

- **Grayscale-only color palette** for distraction-free focus
- **No emoji clutter** - clean, professional appearance
- **Subtle animations** - smooth transitions without overwhelming effects

### User Experience

- **Inline interactions** - no modal dialogs to interrupt workflow
- **Contextual grouping** - smart organization by relevance
- **Progressive disclosure** - advanced features available when needed

### Accessibility

- **Keyboard navigation** support
- **Screen reader friendly** with proper ARIA labels
- **High contrast** ratios in both themes
- **Consistent interaction patterns**

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Environment Setup

The application runs entirely client-side with no backend dependencies. All data is stored in browser LocalStorage.

### Code Style

- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Functional components** with React hooks

## 📈 Performance

### Optimizations

- **Memoized calculations** for expensive operations
- **Optimized re-renders** with proper dependency arrays
- **Efficient grouping algorithms** using useMemo
- **Minimal bundle size** with Next.js optimization

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines

- Follow existing TypeScript patterns
- Maintain grayscale-only design system
- Add proper type definitions
- Test on both light and dark themes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For the Geist font family
- **react-confetti** - For the celebration animations

---

**Built with ❤️ for productivity enthusiasts who value clean, distraction-free interfaces.**

_Stride - Progress tracking, simplified._
