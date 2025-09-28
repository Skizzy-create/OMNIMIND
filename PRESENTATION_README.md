# OmniMind Protocol - Pitch Deck Presentation

## Overview
This is an interactive pitch deck presentation for OmniMind Protocol, built with React and React Router. The presentation includes 5 key slides covering the problem, solution, business model, and growth projections for Web3's Universal Knowledge Infrastructure Layer.

## Features
- **Interactive Navigation**: Arrow keys (← →) or click navigation
- **Slide Indicators**: Visual dots showing current slide position
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with gradients and animations

## How to Use

### Running the Presentation
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the application in your browser

3. Click on the **"Pitch Deck"** tab in the navigation

### Navigation Controls
- **Arrow Keys**: Use ← → arrow keys to navigate between slides
- **Mouse**: Click the arrow buttons on the left/right sides
- **Indicators**: Click the dots at the top to jump to specific slides
- **Keyboard**: Arrow keys for quick navigation

### Slide Structure
1. **Cover Slide**: Title, tagline, and key statistics
2. **Problem Slide**: The crisis and pain points in AI agent development
3. **Solution Slide**: OmniMind Protocol's approach and technical architecture
4. **Business Model Slide**: Revenue streams, unit economics, and market opportunity
5. **Growth Slide**: Projections, go-to-market strategy, and vision

## Technical Details
- Built with React 18 and TypeScript
- Uses React Router DOM for navigation
- Styled with CSS modules and modern CSS features
- Responsive design with mobile-first approach
- Keyboard accessibility support

## Customization
The slides are built as individual React components in the `/src/components/slides/` directory. You can easily:
- Modify slide content by editing the component files
- Add new slides by creating new components and updating the slides array
- Change styling by modifying the CSS files
- Update the color scheme by changing the CSS custom properties

## File Structure
```
src/
├── components/
│   ├── PresentationApp.tsx          # Main presentation container
│   ├── PresentationApp.css          # Presentation styles
│   └── slides/                      # Individual slide components
│       ├── CoverSlide.tsx
│       ├── ProblemSlide.tsx
│       ├── SolutionSlide.tsx
│       ├── BusinessModelSlide.tsx
│       └── GrowthSlide.tsx
└── App.tsx                          # Main app with navigation
```

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Optimized for smooth transitions
- Lazy loading of slide content
- Minimal bundle size
- Fast navigation between slides
