let overlay = document.querySelector(".overlay")
let closeBtn = document.querySelector(".close")
closeBtn.addEventListener("click", () => {
  overlay.style.display = "none"
  document.querySelector("body").classList.remove("overlayOpen")
})

let main = document.querySelector("main > div")

function getThisWeek() {
  let today = new Date()
  let day = today.getDay()

  let monday = new Date()
  let diff = day === 0 ? -6 : 1 - day
  monday.setDate(today.getDate() + diff)

  let week = []
  for (let i = 0; i < 7; i++) {
    let d = new Date()
    d.setDate(monday.getDate() + i)
    week.push(d)
  }
  return week
}

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

let thisWeek = getThisWeek()
let mealNames = ["Breakfast", "Lunch", "Dinner", "Notes"]
let recipes
let searchInput = document.querySelector(".search")
let recipesContainer = document.querySelector(".recipes")
let modalTitle = document.querySelector(".modal-title")
let clearBtn = document.getElementById("clear-plan")
let generateBtn = document.getElementById("generate-plan")
let exportBtn = document.getElementById("export-plan")

function getMealPlannerKey() {
  let id = sessionStorage.getItem("userId")
  let currentUserId = id || "anonymous"
  return `${currentUserId}:MealPlanner`
}

let inMemoryPlan = {} 

function isAnonymousUser() {
  return !sessionStorage.getItem("userId")
}

function getCurrentPlan() {
  if (isAnonymousUser()) {
    let raw = sessionStorage.getItem("anonymous:MealPlanner")
    try {
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      console.error("Bad anon meal plan data, resetting", e)
      return {}
    }
  }
  let raw = localStorage.getItem(getMealPlannerKey())
  try {
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error("Bad meal plan data, resetting", e)
    return {}
  }
}

function setCurrentPlan(plan) {
  if (isAnonymousUser()) {
    sessionStorage.setItem("anonymous:MealPlanner", JSON.stringify(plan))
  } else {
    localStorage.setItem(getMealPlannerKey(), JSON.stringify(plan))
  }
}

let recipesLoader = document.createElement("div")
recipesLoader.className = "loading-indicator"
recipesLoader.innerHTML = `
  <span class="spinner"></span>
  <span>Loading recipes...</span>
`
recipesLoader.style.display = "none"
recipesContainer.parentNode.insertBefore(recipesLoader, recipesContainer)

function setRecipesLoading(isLoading) {
  recipesLoader.style.display = isLoading ? "flex" : "none"
}

clearBtn.addEventListener("click", async () => {
  let confirmed = await appConfirm("Clear your entire weekly plan?")
  if (!confirmed) return

  if (isAnonymousUser()) {
    sessionStorage.removeItem("anonymous:MealPlanner")
  } else {
    localStorage.removeItem(getMealPlannerKey())
  }

  renderLayout()
})

generateBtn.addEventListener("click", async () => {
  if (!recipes || !recipes.length) {
    await appConfirm("Recipes are still loading. Try again in a moment.", true)
    return
  }

  let plan = getCurrentPlan()

  let sections = document.querySelectorAll("main section.day-section")
  let createdCount = 0

  sections.forEach((section) => {
    let day = section.getAttribute("data-day")
    mealNames.forEach((mealType) => {
      if (mealType === "Notes") return
      let key = `${day}-${mealType}`
      if (plan[key]) return
      let randomMeal = recipes[Math.floor(Math.random() * recipes.length)]
      plan[key] = {
        name: randomMeal.name,
        image: randomMeal.image,
      }
      createdCount++
    })
  })

  if (createdCount === 0) {
    await appConfirm("All meal slots are already filled. Nothing to generate.", true)
    return
  }

  setCurrentPlan(plan)
  loadSavedMeals()
})

exportBtn.addEventListener("click", async () => {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    await appConfirm("PDF library (jsPDF) failed to load.", true)
    return
  }

  let saved = getCurrentPlan()
  if (!Object.keys(saved).length) {
    await appConfirm("You don't have any meals in your plan yet.", true)
    return
  }

  let { jsPDF } = window.jspdf
  let doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  let pageWidth = doc.internal.pageSize.getWidth()
  let pageHeight = doc.internal.pageSize.getHeight()

  let marginX = 10
  let marginY = 15
  let lineHeight = 7

  let start = thisWeek[0]
  let end = thisWeek[thisWeek.length - 1]
  let dateRange = `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]
    } ${end.getDate()}`

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("Weekly Meal Plan", pageWidth / 2, marginY, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(dateRange, pageWidth / 2, marginY + 6, { align: "center" })

  let headers = ["Day", "Breakfast", "Lunch", "Dinner", "Notes"]
  let tableTop = marginY + 15
  let tableWidth = pageWidth - marginX * 2
  let colWidthDay = 30
  let colWidthOther = (tableWidth - colWidthDay) / (headers.length - 1)
  let rowHeight = 20

  function drawHeaderRow(y) {
    let x = marginX
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)

    headers.forEach((header, i) => {
      let w = i === 0 ? colWidthDay : colWidthOther
      doc.rect(x, y, w, rowHeight)
      doc.text(header, x + 2, y + rowHeight / 2 + 3)
      x += w
    })
  }

  let y = tableTop
  drawHeaderRow(y)
  y += rowHeight

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)

  thisWeek.forEach((d) => {
    let dayName = days[d.getDay()]
    let dateLabel = `${months[d.getMonth()]} ${d.getDate()}`

    let row = { Breakfast: "", Lunch: "", Dinner: "", Notes: "" }

    mealNames.forEach((mealType) => {
      let key = `${dayName}-${mealType}`
      let data = saved[key]
      if (!data) return
      let text = typeof data === "string" ? data : data.name
      if (mealType === "Notes") row.Notes = text
      else row[mealType] = text
    })

    if (!row.Breakfast && !row.Lunch && !row.Dinner && !row.Notes) return

    if (y + rowHeight > pageHeight - marginY) {
      doc.addPage()
      y = marginY
      drawHeaderRow(y)
      y += rowHeight
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
    }

    let x = marginX

    let w = colWidthDay
    doc.rect(x, y, w, rowHeight)
    doc.text(dayName, x + 2, y + 4)
    doc.text(dateLabel, x + 2, y + 8)
    x += w

    function drawCell(text) {
      let w = colWidthOther
      doc.rect(x, y, w, rowHeight)
      if (text) {
        doc.text(String(text), x + 2, y + rowHeight / 2 + 3, {
          maxWidth: w - 4,
        })
      }
      x += w
    }

    drawCell(row.Breakfast)
    drawCell(row.Lunch)
    drawCell(row.Dinner)
    drawCell(row.Notes)

    y += rowHeight
  })

  let groceryItems = buildGroceryList(saved)

  if (groceryItems.length) {
    doc.addPage()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Weekly Grocery List", pageWidth / 2, marginY, {
      align: "center",
    })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)

    let gy = marginY + 8
    groceryItems.forEach((item) => {
      if (gy > pageHeight - marginY) {
        doc.addPage()
        gy = marginY
      }
      doc.text(`• ${item}`, marginX, gy)
      gy += lineHeight
    })
  }

  doc.save("weekly-meal-plan.pdf")
})

function buildGroceryList(saved) {
  if (!recipes || !recipes.length) return []

  let counts = new Map()

  let measurementUnits = new Set([
    "g",
    "gram",
    "grams",
    "kg",
    "ml",
    "l",
    "liter",
    "liters",
    "cup",
    "cups",
    "tbsp",
    "tablespoon",
    "tablespoons",
    "tsp",
    "teaspoon",
    "teaspoons",
  ])

  Object.keys(saved).forEach((key) => {
    if (key.endsWith("-Notes")) return

    let entry = saved[key]
    if (!entry) return

    let mealName = typeof entry === "string" ? entry : entry.name
    if (!mealName) return

    let recipe = recipes?.find((r) => r.name === mealName)
    if (!recipe || !recipe.ingredients) return

    recipe.ingredients.forEach((rawIng) => {
      if (!rawIng) return

      let ingStr =
        typeof rawIng === "string"
          ? rawIng
          : rawIng.name || rawIng.item || ""
      if (!ingStr) return

      let s = ingStr.toLowerCase()

      s = s.replace(/\([^)]*\)/g, "").replace(/,/g, " ").trim()

      let qty = 1
      let namePart = s

      let m = s.match(/^(\d+(?:\.\d+)?)\s+([a-z]+)\s+(.*)$/)
      if (m) {
        let num = parseFloat(m[1])
        let unit = m[2]
        let rest = m[3]
        let isMeasureUnit = measurementUnits.has(unit.replace(/s$/, ""))

        qty = isMeasureUnit || isNaN(num) ? 1 : num
        namePart = rest
      } else {
        let m2 = s.match(/^(\d+(?:\.\d+)?)\s+(.*)$/)
        if (m2) {
          let num = parseFloat(m2[1])
          qty = isNaN(num) ? 1 : num
          namePart = m2[2]
        }
      }

      let words = namePart.split(/\s+/)
      let adjectives = new Set([
        "small",
        "medium",
        "large",
        "fresh",
        "chopped",
        "diced",
        "minced",
        "sliced",
      ])
      while (words.length > 1 && adjectives.has(words[0])) {
        words.shift()
      }

      let name = words.join(" ").trim()
      if (!name) return

      let current = counts.get(name) || 0
      counts.set(name, current + qty)
    })
  })

  let result = []
  for (let [name, qty] of counts.entries()) {
    let rounded = Math.round(qty * 100) / 100

    if (rounded === 1) {
      result.push(`1 ${name}`)
    } else {
      let pluralName = name
      if (!pluralName.endsWith("s")) pluralName += "s"
      result.push(`${rounded} ${pluralName}`)
    }
  }

  return result.sort((a, b) => a.localeCompare(b))
}

function renderRecipeCard(meal) {
  return `
    <div class="recipe-item" 
         data-name="${meal.name}"
         data-image="${meal.image}">
      <div class="recipe-thumb">
        <img src="${meal.image}" alt="${meal.name}">
      </div>
      <div class="recipe-info">
        <h3>${meal.name}</h3>
        <div class="recipe-meta">
          <div class="meta-left">
            <i class="bi bi-clock"></i>
            <span>${meal.prep_time + meal.cook_time} min</span>
          </div>
          <span class="meta-calories">${meal.calories} cal</span>
        </div>
        ${meal.diet_category
      ? `<div class="recipe-tags">
                 <span class="recipe-tag">${meal.diet_category}</span>
               </div>`
      : ""
    }
      </div>
    </div>
  `
}

function getUserMyRecipes() {
  let id = sessionStorage.getItem("userId")
  let currentUserId = id || "anonymous"
  let parsed = JSON.parse(localStorage.getItem(`${currentUserId}: MyRecipes`)) || []
  return Array.isArray(parsed) ? parsed : []
}

function fetchAllRecipes() {
  setRecipesLoading(true)

  fetch("../js/data.json")
    .then((res) => res.json())
    .then((data) => {
      let baseRecipes = data.recipes || []
      let userRecipes = getUserMyRecipes()
      recipes = baseRecipes.concat(userRecipes)
    })
    .catch((e) => {
      console.error("error fetching",e)
      appConfirm("Couldn't load recipes. Please refresh the page.", true)
    })
    .finally(() => setRecipesLoading(false))
}
fetchAllRecipes()

function renderLayout() {
  let html = ""

  thisWeek.forEach((d) => {
    let dayName = days[d.getDay()]
    let dateLabel = `${months[d.getMonth()]} ${d.getDate()}`

    html += `<section class="day-section" data-day="${dayName}">
      <div class="day-info">
        <p>${dayName}</p>
        <p>${dateLabel}</p>
      </div>`

    mealNames.forEach((mealType) => {
      html += `
        <div class="meal-slot" data-meal="${mealType}">
          <span class="meal-label">${mealType}</span>
          <div class="meal-body">
            <span class="meal-placeholder">+</span>
          </div>
        </div>`
    })

    html += `</section>`
  })

  main.innerHTML = html

  setSlotListeners()
  loadSavedMeals()

}
searchInput.addEventListener("input", () => {
  let query = searchInput.value.toLowerCase()
  recipesContainer.innerHTML = ""

  let filtered = !query.trim()
    ? recipes
    : recipes?.filter((meal) => meal.name.toLowerCase().includes(query))

  if (!filtered || filtered.length === 0) {
    recipesContainer.innerHTML = `<p class="no-results">No recipes found</p>`
    return
  }

  filtered.forEach((meal) => {
    recipesContainer.innerHTML += renderRecipeCard(meal)
  })

  attachRecipeClickListeners()
})

function attachRecipeClickListeners() {
  let recipeDivs = recipesContainer.querySelectorAll(".recipe-item")

  recipeDivs.forEach((recipeDiv) => {
    recipeDiv.addEventListener("click", () => {
      let mealName = recipeDiv.dataset.name
      let mealImage = recipeDiv.dataset.image

      let selectedRecipe = recipes?.find((r) => r.name === mealName)

      let openSection = document.querySelector("section.day-section.active-slot")
      if (!openSection) return

      let day = openSection.getAttribute("data-day")
      let mealDivs = Array.from(openSection.querySelectorAll(".meal-slot"))
      let activeSlot = openSection.querySelector(".meal-slot.active")
      let mealIndex = mealDivs.indexOf(activeSlot)
      let mealType = mealNames[mealIndex]

      let mealData = {
        name: mealName,
        image: mealImage,
      }

      saveMeal(day, mealType, mealData)

      overlay.style.display = "none"
      document.querySelector("body").classList.remove("overlayOpen")
      if (searchInput) searchInput.value = ""

      document
        .querySelectorAll(".active-slot, .meal-slot.active")
        .forEach((el) => el.classList.remove("active-slot", "active"))

      loadSavedMeals()
    })
  })
}

function loadSavedMeals() {
  let saved = getCurrentPlan()

  let sections = document.querySelectorAll("main section.day-section")

  sections.forEach((section) => {
    let day = section.getAttribute("data-day")
    let mealDivs = section.querySelectorAll(".meal-slot")

    mealDivs.forEach((div, index) => {
      let mealType = mealNames[index]
      let key = `${day}-${mealType}`
      let savedMeal = saved[key]

      let body = div.querySelector(".meal-body")
      if (!body) return

      div.classList.remove("has-meal")

      if (savedMeal) {
        if (mealType === "Notes") {
          let noteText = typeof savedMeal === "string" ? savedMeal : savedMeal.name
          body.innerHTML = `<p class="saved-meal note">${noteText}</p>`
        } else {
          let data =
            typeof savedMeal === "string" ? { name: savedMeal, image: null } : savedMeal

          let img = data.image || ""

          body.innerHTML = `
        <div class="saved-meal saved-meal-card">
          <div class="saved-meal-thumb">
            <img src="${img}" alt="${data.name}">
          </div>
          <div class="saved-meal-text">
            <h4>${data.name}</h4>
          </div>
        </div>
      `

          div.classList.add("has-meal")
        }
      } else {
        body.innerHTML = `<span class="meal-placeholder">+</span>`
      }
    })

  })

  document.querySelectorAll(".saved-meal").forEach((mealEl) => {
    let parentSlot = mealEl.closest(".meal-slot")
    let body = parentSlot.querySelector(".meal-body")

    mealEl.addEventListener("click", async (e) => {
      e.stopPropagation()
      let section = e.target.closest("section.day-section")
      let day = section.getAttribute("data-day")
      let mealDivs = Array.from(section.querySelectorAll(".meal-slot"))
      let mealIndex = mealDivs.indexOf(parentSlot)
      let mealType = mealNames[mealIndex]

      if (mealType === "Notes") {
        openNoteModal(day)
        return
      }

      if (await appConfirm("Remove this recipe?")) {
        removeMeal(day, mealType)
        body.innerHTML = `<span class="meal-placeholder">+</span>`
        parentSlot.classList.remove("has-meal")
      }
    })
  })
}

function setSlotListeners() {
  let slots = document.querySelectorAll(".meal-slot")

  slots.forEach((slot) => {
    slot.replaceWith(slot.cloneNode(true))
  })

  slots = document.querySelectorAll(".meal-slot")

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      let section = slot.closest("section.day-section")
      let day = section.getAttribute("data-day")
      let mealDivs = Array.from(section.querySelectorAll(".meal-slot"))
      let mealIndex = mealDivs.indexOf(slot)
      let mealType = mealNames[mealIndex]

      document
        .querySelectorAll(".active-slot, .meal-slot.active")
        .forEach((el) => el.classList.remove("active-slot", "active"))
      section.classList.add("active-slot")
      slot.classList.add("active")

      if (mealType === "Notes") {
        openNoteModal(day)
        return
      }

      if (slot.querySelector(".saved-meal")) return

      if (modalTitle) {
        modalTitle.textContent = `Choose a recipe for ${day} ${mealType.toLowerCase()}`
      }

      overlay.style.display = "flex"
      document.querySelector("body").classList.add("overlayOpen")
      recipesContainer.innerHTML = ""

      if (!recipes) {
        recipesContainer.innerHTML = `<p class="no-results">Loading recipes...</p>`
      } else {
        recipes.forEach((meal) => {
          recipesContainer.innerHTML += renderRecipeCard(meal)
        })
      }

      attachRecipeClickListeners()
    })
  })
}

function saveMeal(day, mealType, mealData) {
  let saved = getCurrentPlan()
  saved[`${day}-${mealType}`] = mealData
  setCurrentPlan(saved)
}

function removeMeal(day, mealType) {
  let saved = getCurrentPlan()
  delete saved[`${day}-${mealType}`]
  setCurrentPlan(saved)
}

overlay.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) {
    e.target.style.display = "none"
    document.querySelector("body").classList.remove("overlayOpen")
    if (searchInput) searchInput.value = ""
    document
      .querySelectorAll(".active-slot, .meal-slot.active")
      .forEach((el) => el.classList.remove("active-slot", "active"))
  }
})

renderLayout()

function openNoteModal(day) {
  let modal = document.createElement("div")
  modal.className = "note-modal"
  modal.innerHTML = `
    <div class="note-box">
      <div class="note-header">
        <h3>Add Note for ${day}</h3>
        <i class="bi bi-x-lg close-note"></i>
      </div>
      <textarea placeholder="Write your note here..."></textarea>
      <button class="save-note">Save Note</button>
    </div>
  `
  document.body.appendChild(modal)

  let closeNote = modal.querySelector(".close-note")
  let saveNote = modal.querySelector(".save-note")
  let textarea = modal.querySelector("textarea")

  closeNote.addEventListener("click", () => modal.remove())
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("note-modal")) modal.remove()
  })

  saveNote.addEventListener("click", async () => {
    let note = textarea.value.trim()
    if (!note) return await appConfirm("Please write something!",true)
    saveMeal(day, "Notes", note)
    modal.remove()
    loadSavedMeals()
  })
}
