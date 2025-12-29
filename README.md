# DailyBites – Smart Meal Planner

DailyBites is a modern front-end web app that helps users plan their weekly meals, explore recipes, and generate a printable meal plan and grocery list. Built with **React** for dynamic components and **Vite** for fast development, with all data stored in the browser (localStorage / sessionStorage).

## Features

- Welcome landing page and authentication (login / signup simulation)
- Browse all recipes with search, filters, favorites, and detailed recipe modals
- Weekly meal planner with random generation or manual slot selection
- Export the current plan and grocery list to PDF
- Create and manage custom recipes per user
- Responsive layout with shared navbar/footer and scroll animations
- Modern React components for complex state management

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Build System**: npm
- **Hosting**: GitHub Pages

## Project Structure

```
DailyBites/
├── js/
│   ├── components/
│   │   ├── Nav.jsx              # Navigation (React)
│   │   ├── Footer.jsx           # Footer (React)
│   │   ├── MealPlanner.jsx      # Weekly meal planner (React)
│   │   ├── DaySection.jsx       # Day section component
│   │   ├── RecipeSelectionModal.jsx  # Recipe picker
│   │   ├── NoteModal.jsx        # Notes editor
│   │   ├── Recipe.jsx           # Recipe page (React ready)
│   │   ├── RecipeFilters.jsx    # Recipe filters
│   │   ├── RecipeCard.jsx       # Recipe card display
│   │   ├── RecipeModal.jsx      # Recipe detail modal
│   │   └── AddToPlanModal.jsx   # Add recipe to planner
│   ├── recipe.js                # Recipe page logic
│   ├── mealPlanner.js           # Original meal planner logic
│   ├── home.js                  # Home page logic
│   ├── about.js                 # About page logic
│   ├── customer.js              # Custom recipe creation
│   ├── auth.js                  # Authentication logic
│   ├── index.js                 # Landing page animations
│   ├── reactMount.jsx           # React component mounting
│   └── data.json                # Recipe database
├── html/
│   ├── home.html
│   ├── recipe.html
│   ├── mealPlanner.html
│   ├── customer.html
│   ├── about.html
│   └── auth.html
├── css/
│   ├── home.css
│   ├── recipe.css
│   ├── mealPlanner.css
│   ├── customer.css
│   ├── about.css
│   └── auth.css
├── layout/
│   ├── css/
│   │   └── base.css             # Shared styling
│   ├── js/
│   │   ├── utilities.js         # Shared utilities (modals, smooth scroll, etc.)
│   │   └── main.js              # Original shared JS (deprecated)
│   └── html/
│       ├── nav.html
│       └── footer.html
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
└── index.html                   # Landing page
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Hsenghaddar/DailyBites.git
cd DailyBites

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The project uses **Vite** for fast development with hot module replacement (HMR). When running `npm run dev`, the app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### React Components

#### Nav.jsx & Footer.jsx
- Automatically mounted on all pages that include the nav/footer divs
- Handles responsive hamburger menu and login/logout state
- Uses sessionStorage for user authentication state

#### MealPlanner.jsx
- Fully React-based meal planning interface
- State management for weekly meal plan
- localStorage/sessionStorage integration for persistence
- Features:
  - Random meal generation
  - Manual recipe selection with search
  - Add/remove meals from slots
  - Export to PDF
  - Add notes per day

### Original JavaScript Pages

The following pages still use original JavaScript but can be migrated to React:
- **recipe.html** - Recipe browsing and filtering
- **customer.html** - Custom recipe creation
- **auth.html** - Authentication
- **home.html** - Homepage with stats
- **about.html** - About page

## Live Demo

DailyBites is hosted on GitHub Pages:

👉 https://hsenghaddar.github.io/DailyBites/

## Build & Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains the production-ready files
# Deploy to GitHub Pages or any static hosting
```

## Data Storage

- **Recipes**: Loaded from `js/data.json`
- **User Favorites**: localStorage (persists across sessions)
- **Meal Plan**: localStorage (per user) or sessionStorage (anonymous)
- **Custom Recipes**: localStorage (per user)
- **Authentication State**: sessionStorage (current session only)

## Authors

- Reem W. Basho – 20240020 (integrating now react and django)
- Aya Hajjaoui – 20240263
- Hussein Ghaddar – 20240125