import React, { useEffect, useState } from 'react';
import { RecipeFilters } from './RecipeFilters';
import { RecipeCard } from './RecipeCard';
import { RecipeModal } from './RecipeModal';
import { AddToPlanModal } from './AddToPlanModal';
import '../../css/recipe.css';

export const Recipe = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [mealPlanRecipe, setMealPlanRecipe] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    mealType: null,
    dietTypes: [],
    difficulty: null,
    quickFilter: null,
    ingredients: [],
    favoritesOnly: false,
  });

  const plannerDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const plannerMealTypes = ["Breakfast", "Lunch", "Dinner"];

  const getStorageKey = (type) => {
    const userId = sessionStorage.getItem('userId');
    return userId ? `${userId}:${type}` : `anonymous:${type}`;
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
      position: fixed;
      top: 10%;
      right: 40%;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1100;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;

    const bgColor = type === 'error' ? '#dc2626' : type === 'info' ? '#2563eb' : '#16a34a';
    notification.style.background = bgColor;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Load recipes and favorites on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('../js/data.json');
        if (!response.ok) throw new Error('Failed to load recipes');
        const data = await response.json();
        const recipes = data.recipes || [];
        setAllRecipes(recipes);

        const saved = localStorage.getItem(getStorageKey('favorites'));
        setFavoriteRecipes(JSON.parse(saved || '[]'));
        showNotification('Recipes loaded successfully!', 'success');
      } catch (error) {
        console.error('Error loading recipes:', error);
        showNotification('Failed to load recipes', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter recipes when filters or recipes change
  useEffect(() => {
    const filtered = allRecipes.filter((recipe) => {
      // Favorite filter
      if (currentFilters.favoritesOnly && !favoriteRecipes.includes(recipe.id)) {
        return false;
      }

      // Search filter
      if (currentFilters.search) {
        const searchText = `${recipe.name} ${recipe.description} ${recipe.meal_category} ${recipe.diet_category} ${recipe.difficulty} ${(recipe.tags || []).join(' ')} ${(recipe.ingredients || []).join(' ')}`.toLowerCase();
        if (!searchText.includes(currentFilters.search.toLowerCase())) return false;
      }

      // Ingredient filter (comma-separated)
      if (currentFilters.ingredients.length > 0) {
        const ingredientsText = (recipe.ingredients || []).join(' ').toLowerCase();
        const hasAll = currentFilters.ingredients.every((ing) =>
          ingredientsText.includes(ing.toLowerCase())
        );
        if (!hasAll) return false;
      }

      // Meal type filter
      if (currentFilters.mealType && recipe.meal_category !== currentFilters.mealType) {
        return false;
      }

      // Diet type filter
      if (currentFilters.dietTypes.length > 0) {
        if (!currentFilters.dietTypes.includes(recipe.diet_category)) {
          return false;
        }
      }

      // Difficulty filter
      if (currentFilters.difficulty && recipe.difficulty !== currentFilters.difficulty) {
        return false;
      }

      // Quick filter
      if (currentFilters.quickFilter) {
        const totalTime = recipe.prep_time + recipe.cook_time;
        switch (currentFilters.quickFilter) {
          case 'Quick & Easy':
            return recipe.difficulty === 'Easy' && totalTime <= 30;
          case 'Healthy':
            return recipe.calories <= 450;
          case 'Vegetarian':
            return recipe.diet_category === 'Vegetarian';
          case 'High Protein':
            return recipe.protein >= 20;
          case 'Low Carb':
            return recipe.carbs <= 20;
          default:
            return true;
        }
      }

      return true;
    });

    setFilteredRecipes(filtered);
  }, [allRecipes, currentFilters, favoriteRecipes]);

  const updateFilter = (filterName, value) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleSearchChange = (rawInput) => {
    const hasComma = rawInput.includes(',');

    if (hasComma) {
      const ingredients = rawInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      updateFilter('ingredients', ingredients);
      updateFilter('search', '');
    } else {
      updateFilter('search', rawInput.toLowerCase());
      updateFilter('ingredients', []);
    }
  };

  const toggleFavorite = (recipeId) => {
    setFavoriteRecipes((prev) => {
      let updated;
      if (prev.includes(recipeId)) {
        updated = prev.filter((id) => id !== recipeId);
        showNotification('Removed from favorites', 'info');
      } else {
        updated = [...prev, recipeId];
        showNotification('Added to favorites!', 'success');
      }
      localStorage.setItem(getStorageKey('favorites'), JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavoritesFilter = () => {
    const newValue = !currentFilters.favoritesOnly;
    updateFilter('favoritesOnly', newValue);
    
    if (newValue) {
      const favCount = favoriteRecipes.length;
      if (favCount > 0) {
        showNotification(`Showing ${favCount} favorite recipes`, 'success');
      } else {
        showNotification('No favorite recipes yet!', 'info');
      }
    } else {
      showNotification('Showing all recipes', 'info');
    }
  };

  const clearAllFilters = () => {
    setCurrentFilters({
      search: '',
      mealType: null,
      dietTypes: [],
      difficulty: null,
      quickFilter: null,
      ingredients: [],
      favoritesOnly: false,
    });
    showNotification('All filters cleared', 'info');
  };

  const hasActiveFilters = () => {
    return currentFilters.search !== '' ||
      currentFilters.mealType !== null ||
      currentFilters.dietTypes.length > 0 ||
      currentFilters.difficulty !== null ||
      currentFilters.quickFilter !== null ||
      currentFilters.ingredients.length > 0 ||
      currentFilters.favoritesOnly;
  };

  const handleOpenAddToPlan = (recipe) => {
    if (!sessionStorage.getItem('userId')) {
      appConfirm('Please login to add to plan.').then((confirmed) => {
        if (confirmed) window.location.href = '../html/auth.html';
      });
      return;
    }
    setMealPlanRecipe(recipe);
    setShowAddToPlanModal(true);
  };

  return (
    <main>
      <RecipeFilters 
        filters={currentFilters} 
        onFilterChange={updateFilter}
        onSearchChange={handleSearchChange}
        onToggleFavoriteFilter={toggleFavoritesFilter}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters()}
        allRecipes={allRecipes}
      />

      <section className="recipes-section">
        {isLoading ? (
          <div className="loading-indicator">
            <span className="spinner"></span>
            <span>Loading recipes...</span>
          </div>
        ) : (
          <>
            <div id="count" style={{ marginBottom: '1rem' }}>
              Found {filteredRecipes.length} recipes out of {allRecipes.length} total
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="no-recipes">
                <p>No recipes found matching your criteria. Try changing your filters or search terms!</p>
              </div>
            ) : (
              <ul id="recipes" className="recipe-cards">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFavorite={favoriteRecipes.includes(recipe.id)}
                    onFavoriteToggle={() => toggleFavorite(recipe.id)}
                    onQuickView={() => setSelectedRecipe(recipe)}
                    onAddToPlan={() => handleOpenAddToPlan(recipe)}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isFavorite={favoriteRecipes.includes(selectedRecipe.id)}
          onFavoriteToggle={() => toggleFavorite(selectedRecipe.id)}
          onClose={() => setSelectedRecipe(null)}
          onAddToPlan={() => {
            handleOpenAddToPlan(selectedRecipe);
            setSelectedRecipe(null);
          }}
        />
      )}

      {showAddToPlanModal && mealPlanRecipe && (
        <AddToPlanModal
          recipe={mealPlanRecipe}
          onClose={() => setShowAddToPlanModal(false)}
          plannerDays={plannerDays}
          plannerMealTypes={plannerMealTypes}
          getStorageKey={getStorageKey}
          showNotification={showNotification}
        />
      )}
    </main>
  );
};
