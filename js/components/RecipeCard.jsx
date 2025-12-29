import React, { useState } from 'react';

export const RecipeCard = ({ recipe, isFavorite, onFavoriteToggle, onQuickView, onAddToPlan }) => {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagDialogPos, setTagDialogPos] = useState({ top: 0, left: 0 });

  const totalTime = recipe.prep_time + recipe.cook_time;

  // Prepare all tags
  const allTags = [recipe.meal_category, recipe.diet_category, ...(recipe.tags || [])]
    .filter(Boolean)
    .reduce((acc, tag) => {
      if (!acc.find((t) => t.toLowerCase() === tag.toLowerCase())) {
        acc.push(tag);
      }
      return acc;
    }, []);

  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const maxVisibleTags = isMobile ? 2 : 3;

  const visibleTags = allTags.slice(0, maxVisibleTags);
  const hiddenTags = allTags.slice(maxVisibleTags);

  const handleMoreTagsHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTagDialogPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX + 80,
    });
    setShowTagDialog(true);
  };

  const handleMoreTagsLeave = () => {
    setTimeout(() => setShowTagDialog(false), 100);
  };

  const createStarRating = (rating) => {
    const numberRating = parseFloat(rating);
    const fullStars = Math.floor(numberRating);
    const hasHalfStar = (numberRating % 1) >= 0.5;

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="star" viewBox="0 0 24 24" width="16" height="16">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="#fbbf24"
            stroke="#f59e0b"
          />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star" viewBox="0 0 24 24" width="16" height="16">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="url(#half)"
            stroke="#f59e0b"
          />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(numberRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="star" viewBox="0 0 24 24" width="16" height="16">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
          />
        </svg>
      );
    }

    return (
      <span className="stars" role="img" aria-label={`Rating: ${numberRating} out of 5 stars`}>
        {stars}
        <span style={{ marginLeft: '4px' }}>{numberRating}</span>
      </span>
    );
  };

  return (
    <li data-id={recipe.id}>
      <div className="thumb">
        <img src={recipe.image} alt={recipe.name} />
        <span className="badge">{recipe.difficulty}</span>

        <div className="hover-icons">
          <button
            className="hover-icon"
            title="Quick View"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button
            className="hover-icon"
            title="Add to Meal Plan"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlan();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="title">{recipe.name}</h3>
      <p className="desc">{recipe.description}</p>

      <ul className="meta">
        <li>
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <time>{totalTime} min</time>
        </li>

        <li>
          <svg className="icon" viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <output>{recipe.calories} cal</output>
        </li>

        <li>{createStarRating(recipe.rating)}</li>
      </ul>

      <div className="tags">
        {visibleTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}

        {hiddenTags.length > 0 && (
          <span
            className="more-toggle"
            onMouseMove={handleMoreTagsHover}
            onMouseLeave={handleMoreTagsLeave}
          >
            +{hiddenTags.length} more
            {showTagDialog && (
              <div
                className="tag-dialog"
                style={{
                  position: 'absolute',
                  top: `${tagDialogPos.top}px`,
                  left: `${tagDialogPos.left}px`,
                }}
                onMouseLeave={handleMoreTagsLeave}
              >
                {allTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </span>
        )}
      </div>

      <footer>
        <button className="btn primary" onClick={onQuickView}>
          View Recipe
        </button>
        <button className="btn ghost" onClick={onAddToPlan}>
          Add to Plan
        </button>
        <button className={`fav ${isFavorite ? 'active' : ''}`} onClick={onFavoriteToggle} title="Add to favorites">
          ♡
        </button>
      </footer>
    </li>
  );
};
