import React, { useState, useEffect } from 'react';

export const RecipeFilters = ({
  filters,
  onFilterChange,
  onSearchChange,
  onToggleFavoriteFilter,
  onClearFilters,
  hasActiveFilters,
  allRecipes,
}) => {
  const [mealTypes, setMealTypes] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const quickFilters = ['Quick & Easy', 'Healthy', 'Vegetarian', 'High Protein', 'Low Carb'];

  // Setup available options from recipes
  useEffect(() => {
    const meals = [...new Set(allRecipes.map((r) => r.meal_category))].sort();
    const diets = [...new Set(allRecipes.map((r) => r.diet_category))].sort();
    const diffs = [...new Set(allRecipes.map((r) => r.difficulty))].sort();

    setMealTypes(meals);
    setDietTypes(diets);
    setDifficulties(diffs);
  }, [allRecipes]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleMealTypeSelect = (mealType) => {
    if (filters.mealType === mealType) {
      onFilterChange('mealType', null);
    } else {
      onFilterChange('mealType', mealType);
    }
  };

  const handleDietTypeSelect = (dietType) => {
    const updated = filters.dietTypes.includes(dietType)
      ? filters.dietTypes.filter((d) => d !== dietType)
      : [...filters.dietTypes, dietType];
    onFilterChange('dietTypes', updated);
  };

  const handleDifficultySelect = (diff) => {
    if (filters.difficulty === diff) {
      onFilterChange('difficulty', null);
    } else {
      onFilterChange('difficulty', diff);
    }
  };

  const handleQuickFilterClick = (filterName) => {
    if (filters.quickFilter === filterName) {
      onFilterChange('quickFilter', null);
    } else {
      onFilterChange('quickFilter', filterName);
      // Deactivate favorites when quick filter is clicked
      if (filters.favoritesOnly) {
        onToggleFavoriteFilter();
      }
    }
  };

  const activeFilterCount = [
    filters.quickFilter ? 1 : 0,
    filters.mealType ? 1 : 0,
    filters.dietTypes.length,
    filters.difficulty ? 1 : 0,
    filters.favoritesOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <section className="filters">
      <input
        id="searchInput"
        className="search-bar"
        type="text"
        placeholder="Search recipes or comma-separated ingredients..."
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="quick-filters">
        {quickFilters.map((filter) => (
          <button
            key={filter}
            className={`quick-pill ${filters.quickFilter === filter ? 'active' : ''}`}
            onClick={() => handleQuickFilterClick(filter)}
          >
            {filter}
          </button>
        ))}

        <button
          id="favoriteFilter"
          className={`quick-pill ${filters.favoritesOnly ? 'active' : ''}`}
          onClick={onToggleFavoriteFilter}
        >
          ♥ Favorites
        </button>
      </div>

      <div className="dropdown-filters">
        <div className="dd-box">
          <button
            className="dd-btn"
            onClick={() => toggleDropdown('meal')}
          >
            {filters.mealType || 'Meal Type'}
          </button>
          {openDropdown === 'meal' && (
            <div className="dd-panel">
              {mealTypes.map((meal) => (
                <button
                  key={meal}
                  className={`dd-item ${filters.mealType === meal ? 'active' : ''}`}
                  onClick={() => handleMealTypeSelect(meal)}
                >
                  {meal}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dd-box">
          <button
            className="dd-btn"
            onClick={() => toggleDropdown('diet')}
          >
            {filters.dietTypes.length > 0 ? `Diet (${filters.dietTypes.length})` : 'Diet Type'}
          </button>
          {openDropdown === 'diet' && (
            <div className="dd-panel">
              {dietTypes.map((diet) => (
                <button
                  key={diet}
                  className={`dd-item ${filters.dietTypes.includes(diet) ? 'active' : ''}`}
                  onClick={() => handleDietTypeSelect(diet)}
                >
                  {diet}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dd-box">
          <button
            className="dd-btn"
            onClick={() => toggleDropdown('difficulty')}
          >
            {filters.difficulty || 'Difficulty'}
          </button>
          {openDropdown === 'difficulty' && (
            <div className="dd-panel">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  className={`dd-item ${filters.difficulty === diff ? 'active' : ''}`}
                  onClick={() => handleDifficultySelect(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div id="filterActions" style={{ display: 'flex', gap: '10px' }}>
          <span id="filterCount" style={{ alignSelf: 'center' }}>
            {activeFilterCount} filters: {filters.quickFilter ? filters.quickFilter : ''} {filters.mealType ? filters.mealType : ''} {filters.dietTypes.join(', ')} {filters.difficulty ? filters.difficulty : ''} {filters.favoritesOnly ? 'Favorites' : ''}
          </span>
          <button id="clearFilters" className="btn ghost" onClick={onClearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
