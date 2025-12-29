import React from 'react';

export const DaySection = ({
  date,
  dayName,
  monthName,
  mealNames,
  mealPlan,
  onSelectMeal,
  onAddNote,
  onRemoveMeal,
}) => {
  const dateLabel = `${monthName} ${date.getDate()}`;

  return (
    <section className="day-section" data-day={dayName}>
      <div className="day-info">
        <p>{dayName}</p>
        <p>{dateLabel}</p>
      </div>

      {mealNames.map((mealType) => {
        const key = `${dayName}-${mealType}`;
        const savedMeal = mealPlan[key];
        const hasMeal = savedMeal !== undefined && savedMeal !== null;

        const handleMealSlotClick = () => {
          if (mealType === 'Notes') {
            onAddNote(dayName);
            return;
          }
          if (hasMeal) {
            return; // Don't open modal if already has meal
          }
          onSelectMeal(dayName, mealType);
        };

        const handleMealClick = async (e) => {
          e.stopPropagation();
          if (mealType === 'Notes') {
            onAddNote(dayName);
            return;
          }
          const confirmed = await appConfirm('Remove this recipe?');
          if (confirmed) {
            onRemoveMeal(dayName, mealType);
          }
        };

        return (
          <div
            key={mealType}
            className={`meal-slot ${hasMeal && mealType !== 'Notes' ? 'has-meal' : ''}`}
            data-meal={mealType}
            onClick={handleMealSlotClick}
          >
            <span className="meal-label">{mealType}</span>
            <div className="meal-body">
              {hasMeal ? (
                mealType === 'Notes' ? (
                  <p className="saved-meal note">
                    {typeof savedMeal === 'string' ? savedMeal : savedMeal.name}
                  </p>
                ) : (
                  <div className="saved-meal saved-meal-card" onClick={handleMealClick}>
                    <div className="saved-meal-thumb">
                      <img src={savedMeal.image} alt={savedMeal.name} />
                    </div>
                    <div className="saved-meal-text">
                      <h4>{savedMeal.name}</h4>
                    </div>
                  </div>
                )
              ) : (
                <span className="meal-placeholder">+</span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};
