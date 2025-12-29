import React, { useState, useEffect, useRef } from 'react';

export const RecipeSelectionModal = ({ day, mealType, recipes, onSelectRecipe, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);
  const overlayRef = useRef(null);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = query.trim()
      ? recipes.filter((recipe) => recipe.name.toLowerCase().includes(query))
      : recipes;
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleRecipeClick = (recipe) => {
    onSelectRecipe(recipe);
  };

  return (
    <div className="overlay" ref={overlayRef} onClick={handleBackdropClick} style={{ display: 'flex' }}>
      <div className="model">
        <div className="modal-header">
          <h2 className="modal-title">
            Choose a recipe for {day} {mealType.toLowerCase()}
          </h2>
          <i className="close bi bi-x-lg" onClick={onClose}></i>
        </div>

        <div className="input-group">
          <i className="bi bi-search"></i>
          <input
            className="search"
            type="text"
            placeholder="Search Recipes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="recipes">
          {filteredRecipes.length === 0 ? (
            <p className="no-results">No recipes found</p>
          ) : (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe.id || recipe.name}
                className="recipe-item"
                data-name={recipe.name}
                data-image={recipe.image}
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="recipe-thumb">
                  <img src={recipe.image} alt={recipe.name} />
                </div>
                <div className="recipe-info">
                  <h3>{recipe.name}</h3>
                  <div className="recipe-meta">
                    <div className="meta-left">
                      <i className="bi bi-clock"></i>
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                    </div>
                    <span className="meta-calories">{recipe.calories} cal</span>
                  </div>
                  {recipe.diet_category && (
                    <div className="recipe-tags">
                      <span className="recipe-tag">{recipe.diet_category}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
