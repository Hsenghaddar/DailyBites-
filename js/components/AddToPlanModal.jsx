import React, { useEffect, useRef } from 'react';

export const AddToPlanModal = ({
  recipe,
  onClose,
  plannerDays,
  plannerMealTypes,
  getStorageKey,
  showNotification,
}) => {
  const [selectedDay, setSelectedDay] = React.useState('Sunday');
  const [selectedMeal, setSelectedMeal] = React.useState('Breakfast');
  const backdropRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('modal-open');

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      handleClose();
    }
  };

  const handleConfirm = async () => {
    const plan = JSON.parse(localStorage.getItem(getStorageKey('MealPlanner')) || '{}');
    const key = `${selectedDay}-${selectedMeal}`;

    const existing = plan[key];
    if (existing) {
      const existingName = typeof existing === 'string' ? existing : existing.name;
      const confirmed = await appConfirm(
        `You already have "${existingName}" planned for ${selectedDay} ${selectedMeal}.\nReplace it with "${recipe.name}"?`
      );
      if (!confirmed) {
        showNotification('Kept your existing meal.', 'info');
        return;
      }
    }

    plan[key] = { name: recipe.name, image: recipe.image };
    localStorage.setItem(getStorageKey('MealPlanner'), JSON.stringify(plan));
    showNotification(`Added "${recipe.name}" to ${selectedDay} ${selectedMeal}`, 'success');
    handleClose();
  };

  return (
    <div className="add-plan-modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="add-plan-modal">
        <h3>Add to Meal Plan</h3>
        <p className="add-plan-sub">Choose a day and meal slot for:</p>
        <p className="add-plan-name">{recipe.name}</p>

        <div className="add-plan-row">
          <label>
            <span>Day</span>
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
              {plannerDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Meal</span>
            <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
              {plannerMealTypes.map((mealType) => (
                <option key={mealType} value={mealType}>
                  {mealType}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="add-plan-actions">
          <button type="button" className="add-plan-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button type="button" className="add-plan-confirm" onClick={handleConfirm}>
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
};
