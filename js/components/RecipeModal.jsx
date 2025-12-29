import React, { useEffect, useRef } from 'react';

export const RecipeModal = ({ recipe, isFavorite, onFavoriteToggle, onClose, onAddToPlan }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      document.body.classList.add('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    document.body.classList.remove('modal-open');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const totalTime = recipe.prep_time + recipe.cook_time;

  // Prepare tags
  const allTags = [recipe.meal_category, recipe.diet_category, ...(recipe.tags || [])]
    .filter(Boolean)
    .reduce((acc, tag) => {
      if (!acc.find((t) => t.toLowerCase() === tag.toLowerCase())) {
        acc.push(tag);
      }
      return acc;
    }, []);

  const handleShare = async () => {
    const shareData = {
      title: recipe.name,
      text: recipe.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Sharing failed:', err);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={handleEscape}
      style={{ position: 'fixed', width: '90%', maxWidth: '800px' }}
    >
      <section className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{recipe.name}</h2>
          <div className="header-actions">
            <button className="save-btn" onClick={onFavoriteToggle}>
              {isFavorite ? '♡ Saved' : '♡ Save Recipe'}
            </button>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        <img
          id="mImg"
          src={recipe.image}
          alt={recipe.name}
          className="modal-image"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%2394a3b8">No Image Available</text></svg>';
          }}
        />

        <p className="modal-description" id="mDesc">
          {recipe.description}
        </p>

        <section className="modal-stats">
          <div className="stat-item">
            <span className="stat-value" id="mTime">
              {totalTime} min
            </span>
            <span className="stat-label">Total Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" id="mCal">
              {recipe.calories} cal
            </span>
            <span className="stat-label">Calories</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" id="mServ">
              {recipe.servings} servings
            </span>
            <span className="stat-label">Servings</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" id="mRating">
              {Number(recipe.rating).toFixed(1)} ★
            </span>
            <span className="stat-label">Rating</span>
          </div>
        </section>

        <div className="modal-meta-grid">
          <div>
            <strong>Meal Type:</strong>
            <p id="mMeal">{recipe.meal_category}</p>
          </div>
          <div>
            <strong>Diet Type:</strong>
            <p id="mDiet">{recipe.diet_category}</p>
          </div>
          <div>
            <strong>Difficulty:</strong>
            <p id="mDiff">{recipe.difficulty}</p>
          </div>
        </div>

        <div className="modal-nutrition">
          <h3>Macronutrients</h3>
          <ul>
            {recipe.protein != null && <li>Protein: {recipe.protein} g</li>}
            {recipe.carbs != null && <li>Carbs: {recipe.carbs} g</li>}
            {recipe.fat != null && <li>Fat: {recipe.fat} g</li>}
          </ul>

          {recipe.micronutrients && Object.keys(recipe.micronutrients).length > 0 && (
            <div>
              <h4>Micronutrients</h4>
              <ul id="mMicros">
                {Object.entries(recipe.micronutrients).map(([key, value]) => (
                  <li key={key}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-tags">
          <h3>Tags</h3>
          <div id="mTags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {allTags.map((tag) => (
              <span key={tag} style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '4px' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <section className="ingredients-section">
          <h3>Ingredients</h3>
          <ul id="mIngr" className="ingredients-list">
            {recipe.ingredients.map((ingredient, idx) => (
              <li
                key={idx}
                style={{ cursor: 'pointer', padding: '8px', userSelect: 'none' }}
                onClick={(e) => e.currentTarget.classList.toggle('checked')}
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section className="instructions-section">
          <h3>Instructions</h3>
          <ol id="mInstr" className="instructions-list">
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((instruction, idx) => (
                <li key={idx}>
                  <div className="instruction-text">{instruction}</div>
                </li>
              ))
            ) : (
              <li>
                <div className="instruction-text" style={{ fontStyle: 'italic', color: '#64748b' }}>
                  No specific instructions provided. Use your best judgment for preparation!
                </div>
              </li>
            )}
          </ol>
        </section>

        <div className="modal-actions">
          <button className="btn primary" onClick={onAddToPlan}>
            Add to Meal Plan
          </button>
          <button className="btn secondary" onClick={handleShare}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
          <button className="btn ghost" onClick={handleClose}>
            Close
          </button>
        </div>
      </section>
    </dialog>
  );
};
