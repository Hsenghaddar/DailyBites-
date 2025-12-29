import React, { useState, useEffect } from 'react';
import { DaySection } from './DaySection';
import { RecipeSelectionModal } from './RecipeSelectionModal';
import { NoteModal } from './NoteModal';
import '../../css/mealPlanner.css';

export const MealPlanner = () => {
  const [mealPlan, setMealPlan] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecipeModal, setShowRecipeModal] = useState(null); // { day, mealType } or null
  const [showNoteModal, setShowNoteModal] = useState(null); // day or null
  const [thisWeek, setThisWeek] = useState([]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mealNames = ["Breakfast", "Lunch", "Dinner", "Notes"];

  const isAnonymousUser = () => !sessionStorage.getItem('userId');

  const getMealPlannerKey = () => {
    const id = sessionStorage.getItem('userId');
    return `${id || 'anonymous'}:MealPlanner`;
  };

  // Get this week's dates
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    setThisWeek(week);
  }, []);

  // Load recipes and meal plan
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load recipes
        const response = await fetch('../js/data.json');
        const data = await response.json();
        const baseRecipes = data.recipes || [];

        // Load user recipes
        const userId = sessionStorage.getItem('userId');
        const currentUserId = userId || 'anonymous';
        const savedUserRecipes = localStorage.getItem(`${currentUserId}: MyRecipes`);
        const userRecipes = Array.isArray(JSON.parse(savedUserRecipes || '[]')) 
          ? JSON.parse(savedUserRecipes || '[]') 
          : [];

        setRecipes([...baseRecipes, ...userRecipes]);

        // Load meal plan
        const key = getMealPlannerKey();
        const stored = isAnonymousUser()
          ? sessionStorage.getItem(key)
          : localStorage.getItem(key);

        const plan = stored ? JSON.parse(stored) : {};
        setMealPlan(plan);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const saveMealPlan = (updatedPlan) => {
    const key = getMealPlannerKey();
    if (isAnonymousUser()) {
      sessionStorage.setItem(key, JSON.stringify(updatedPlan));
    } else {
      localStorage.setItem(key, JSON.stringify(updatedPlan));
    }
    setMealPlan(updatedPlan);
  };

  const addMeal = (day, mealType, mealData) => {
    const key = `${day}-${mealType}`;
    const updated = { ...mealPlan, [key]: mealData };
    saveMealPlan(updated);
  };

  const removeMeal = (day, mealType) => {
    const key = `${day}-${mealType}`;
    const updated = { ...mealPlan };
    delete updated[key];
    saveMealPlan(updated);
  };

  const clearPlan = async () => {
    const confirmed = await appConfirm('Clear your entire weekly plan?');
    if (!confirmed) return;

    const key = getMealPlannerKey();
    if (isAnonymousUser()) {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
    setMealPlan({});
  };

  const generateWeeklyPlan = async () => {
    if (!recipes.length) {
      await appConfirm('Recipes are still loading. Try again in a moment.', true);
      return;
    }

    const updated = { ...mealPlan };
    let createdCount = 0;

    thisWeek.forEach((date) => {
      const dayName = days[date.getDay()];
      mealNames.forEach((mealType) => {
        if (mealType === 'Notes') return;
        const key = `${dayName}-${mealType}`;
        if (updated[key]) return;

        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        updated[key] = {
          name: randomRecipe.name,
          image: randomRecipe.image,
        };
        createdCount++;
      });
    });

    if (createdCount === 0) {
      let confirmed = await appConfirm('All meal slots are already filled. Nothing to generate.\n Do you want to clear all slots?', false);
      if (!confirmed) {
        return;
      }
      clearPlan();
    }

    saveMealPlan(updated);
  };

  const exportToPDF = async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      await appConfirm('PDF library (jsPDF) failed to load.', true);
      return;
    }

    if (!Object.keys(mealPlan).length) {
      await appConfirm("You don't have any meals in your plan yet.", true);
      return;
    }

    // PDF generation logic (copy from mealPlanner.js)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 10;
    const marginY = 15;

    const start = thisWeek[0];
    const end = thisWeek[thisWeek.length - 1];
    const dateRange = `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Weekly Meal Plan', pageWidth / 2, marginY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(dateRange, pageWidth / 2, marginY + 6, { align: 'center' });

    // Table headers
    const headers = ['Day', 'Breakfast', 'Lunch', 'Dinner', 'Notes'];
    const tableTop = marginY + 15;
    const tableWidth = pageWidth - marginX * 2;
    const colWidthDay = 30;
    const colWidthOther = (tableWidth - colWidthDay) / (headers.length - 1);
    const rowHeight = 20;

    function drawHeaderRow(y) {
      let x = marginX;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      headers.forEach((header, i) => {
        const w = i === 0 ? colWidthDay : colWidthOther;
        doc.rect(x, y, w, rowHeight);
        doc.text(header, x + 2, y + rowHeight / 2 + 3);
        x += w;
      });
    }

    let y = tableTop;
    drawHeaderRow(y);
    y += rowHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    thisWeek.forEach((d) => {
      const dayName = days[d.getDay()];
      const dateLabel = `${months[d.getMonth()]} ${d.getDate()}`;

      const row = { Breakfast: '', Lunch: '', Dinner: '', Notes: '' };

      mealNames.forEach((mealType) => {
        const key = `${dayName}-${mealType}`;
        const data = mealPlan[key];
        if (!data) return;
        const text = typeof data === 'string' ? data : data.name;
        if (mealType === 'Notes') row.Notes = text;
        else row[mealType] = text;
      });

      if (!row.Breakfast && !row.Lunch && !row.Dinner && !row.Notes) return;

      if (y + rowHeight > pageHeight - marginY) {
        doc.addPage();
        y = marginY;
        drawHeaderRow(y);
        y += rowHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      }

      let x = marginX;
      const w = colWidthDay;
      doc.rect(x, y, w, rowHeight);
      doc.text(dayName, x + 2, y + 4);
      doc.text(dateLabel, x + 2, y + 8);
      x += w;

      function drawCell(text) {
        const w = colWidthOther;
        doc.rect(x, y, w, rowHeight);
        if (text) {
          doc.text(String(text), x + 2, y + rowHeight / 2 + 3, { maxWidth: w - 4 });
        }
        x += w;
      }

      drawCell(row.Breakfast);
      drawCell(row.Lunch);
      drawCell(row.Dinner);
      drawCell(row.Notes);

      y += rowHeight;
    });

    doc.save('weekly-meal-plan.pdf');
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <span className="spinner"></span>
        <span>Loading meal planner...</span>
      </div>
    );
  }

  return (
    <main>
      <h1>Weekly Meal Planner</h1>

      <div className="planner-bar">
        <button id="generate-plan" type="button" className="generate-plan-btn" onClick={generateWeeklyPlan}>
          <i className="bi bi-shuffle"></i>
          <span>Generate Weekly Plan</span>
        </button>
        <button id="clear-plan" type="button" className="clear-plan-btn" onClick={clearPlan}>
          <i className="bi bi-trash3"></i>
          <span>Clear plan</span>
        </button>
        <button id="export-plan" type="button" className="export-plan-btn" onClick={exportToPDF}>
          <i className="bi bi-filetype-pdf"></i>
          <span>Export plan</span>
        </button>
      </div>

      <div className="planner-container">
        {thisWeek.map((date, idx) => (
          <DaySection
            key={idx}
            date={date}
            dayName={days[date.getDay()]}
            monthName={months[date.getMonth()]}
            mealNames={mealNames}
            mealPlan={mealPlan}
            onSelectMeal={(day, mealType) => setShowRecipeModal({ day, mealType })}
            onAddNote={(day) => setShowNoteModal(day)}
            onRemoveMeal={removeMeal}
          />
        ))}
      </div>

      {showRecipeModal && (
        <RecipeSelectionModal
          day={showRecipeModal.day}
          mealType={showRecipeModal.mealType}
          recipes={recipes}
          onSelectRecipe={(recipe) => {
            addMeal(showRecipeModal.day, showRecipeModal.mealType, {
              name: recipe.name,
              image: recipe.image,
            });
            setShowRecipeModal(null);
          }}
          onClose={() => setShowRecipeModal(null)}
        />
      )}

      {showNoteModal && (
        <NoteModal
          day={showNoteModal}
          initialNote={mealPlan[`${showNoteModal}-Notes`] || ''}
          onSave={(note) => {
            addMeal(showNoteModal, 'Notes', note);
            setShowNoteModal(null);
          }}
          onClose={() => setShowNoteModal(null)}
        />
      )}
    </main>
  );
};
