import React from 'react';
import ReactDOM from 'react-dom/client';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { MealPlanner } from './components/MealPlanner';
import '../layout/css/base.css';
import '../layout/js/utilities.js';

// Mount Nav component
const navSlot = document.querySelector('[data-include="nav"]');
if (navSlot) {
  const navRoot = ReactDOM.createRoot(navSlot);
  navRoot.render(<Nav />);
}

// Mount Footer component
const footerSlot = document.querySelector('[data-include="footer"]');
if (footerSlot) {
  const footerRoot = ReactDOM.createRoot(footerSlot);
  footerRoot.render(<Footer />);
}

// Mount MealPlanner component if mealplanner-root exists
const mealPlannerRoot = document.querySelector('#mealplanner-root');
if (mealPlannerRoot) {
  const root = ReactDOM.createRoot(mealPlannerRoot);
  root.render(<MealPlanner />);
}
