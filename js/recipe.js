let allRecipes = []
let favoriteRecipes = JSON.parse(localStorage.getItem(getStorageKey('favorites')) || "[]")

let currentFilters = {
    search: "",
    mealType: null,
    dietTypes: [],
    difficulty: null,
    quickFilter: null,
    ingredients: [],
    favoritesOnly: false
}

let recipesList = document.getElementById("recipes")
let recipesLoader = document.createElement("div")
recipesLoader.className = "loading-indicator"
recipesLoader.innerHTML = `
  <span class="spinner"></span>
  <span>Loading recipes...</span>
`
recipesLoader.style.display = "none"
recipesList.parentNode.insertBefore(recipesLoader, recipesList)

function setRecipesLoading(isLoading) {
    recipesLoader.style.display = isLoading ? "flex" : "none"
}

async function initializeApp() {
    try {
        setRecipesLoading(true)

        allRecipes = await loadAllRecipes()
        console.log('Loaded recipes:', allRecipes.length)
        setupFilters()
        displayRecipes()
        // showNotification('Recipes loaded successfully!', 'success')
        //     } catch (error) {
        console.error('Failed to initialize app:', error)
        showNotification('Failed to load recipes', 'error')
    } finally {
        setRecipesLoading(false)
    }
}


function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        let later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

function getStorageKey(type) {
    let userId = sessionStorage.getItem('userId')
    if (!userId) {
        return 'anonymous:' + type
    }
    return userId + ':' + type
}

function saveFavorites() {
    try {
        localStorage.setItem(getStorageKey('favorites'), JSON.stringify(favoriteRecipes))
    } catch (error) {
        console.error('Failed to save favorites:', error)
        showNotification('Failed to save favorites', 'error')
    }
}

async function loadAllRecipes() {
    try {
        let response = await fetch('../js/data.json')
        if (!response.ok) throw new Error('Network response was not ok')

        let data = await response.json()
        return data.recipes || []
    } catch (error) {
        console.error('Error loading recipes:', error)
        return getFallbackRecipes()
    }
}

function matchesSearchTerm(recipe) {
    if (!currentFilters.search) return true

    let searchTerm = currentFilters.search.toLowerCase()
    let searchableText = `
        ${recipe.name}
        ${recipe.description}
        ${recipe.meal_category}
        ${recipe.diet_category}
        ${recipe.difficulty}
        ${(recipe.tags || []).join(" ")}
        ${(recipe.ingredients || []).join(" ")}
    `.toLowerCase()

    return searchableText.includes(searchTerm)
}

function matchesQuickFilter(recipe) {
    if (!currentFilters.quickFilter) return true

    let filter = currentFilters.quickFilter
    let totalTime = recipe.prep_time + recipe.cook_time

    switch (filter) {
        case "Quick & Easy":
            return recipe.difficulty === "Easy" && totalTime <= 30
        case "Healthy":
            return recipe.calories <= 450
        case "Vegetarian":
            return recipe.diet_category === "Vegetarian"
        case "High Protein":
            return recipe.protein >= 20
        case "Low Carb":
            return recipe.carbs <= 20
        default:
            return true
    }
}

function shouldShowRecipe(recipe) {
    if (currentFilters.favoritesOnly && !favoriteRecipes.includes(recipe.id)) {
        return false
    }
    if (!matchesSearchTerm(recipe)) return false
    if (!matchesQuickFilter(recipe)) return false

    if (currentFilters.ingredients && currentFilters.ingredients.length > 0) {
        let ingredientsText = (recipe.ingredients || [])
            .join(" ")
            .toLowerCase()

        let hasAllIngredients = currentFilters.ingredients.every(term =>
            ingredientsText.includes(term)
        )

        if (!hasAllIngredients) return false
    }

    if (currentFilters.mealType && recipe.meal_category !== currentFilters.mealType) {
        return false
    }

    if (currentFilters.dietTypes.length > 0) {
        let recipeDiet = recipe.diet_category.toLowerCase()
        let hasMatchingDiet = currentFilters.dietTypes.some(diet =>
            diet.toLowerCase() === recipeDiet
        )
        if (!hasMatchingDiet) return false
    }

    if (currentFilters.difficulty && recipe.difficulty !== currentFilters.difficulty) {
        return false
    }

    return true
}

function updateFilterSummary() {
    let summaryElement = document.getElementById("filterCount")
    let activeFilters = []

    if (currentFilters.quickFilter) activeFilters.push(currentFilters.quickFilter)
    if (currentFilters.mealType) activeFilters.push(currentFilters.mealType)
    if (currentFilters.dietTypes.length) activeFilters.push(...currentFilters.dietTypes)
    if (currentFilters.difficulty) activeFilters.push(currentFilters.difficulty)
    if (currentFilters.favoritesOnly) activeFilters.push("Favorites")
    // console.log("barra",activeFilters)

    if (activeFilters.length > 0) {
        summaryElement.textContent = activeFilters.length + ' filters: ' + activeFilters.join(", ")
        summaryElement.parentElement.style.display = 'flex'
        // console.log("if jowa",activeFilters)

    } else {
        summaryElement.textContent = "No filters applied"
        summaryElement.parentElement.style.display = 'none'
        // console.log(activeFilters)
    }
}

function createStarRating(rating) {
    let numberRating = parseFloat(rating)
    let fullStars = Math.floor(numberRating)
    let hasHalfStar = numberRating % 1 >= 0.5

    let starsHTML = '<span class="stars" role="img" aria-label="Rating: ' + numberRating + ' out of 5 stars">'

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<svg class="star" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#fbbf24" stroke="#f59e0b"/></svg>'
    }

    if (hasHalfStar) {
        starsHTML += '<svg class="star" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><defs><linearGradient id="half"><stop offset="50%" stop-color="#fbbf24"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)" stroke="#f59e0b"/></svg>'
    }

    let starsShown = fullStars + (hasHalfStar ? 1 : 0)
    for (let i = starsShown; i < 5; i++) {
        starsHTML += '<svg class="star" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="#d1d5db" stroke-width="2"/></svg>'
    }

    starsHTML += ' <span style="margin-left: 4px">' + numberRating + '</span></span>'
    return starsHTML
}

let plannerDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
let plannerMealTypes = ["Breakfast", "Lunch", "Dinner"]

function isAnonymousUser() {
  return !sessionStorage.getItem("userId")
}

async function saveMealToPlanner(day, mealType, recipe) {
    let plan = JSON.parse(localStorage.getItem(getStorageKey('MealPlanner')) || "{}")
    let key = day + '-' + mealType

    let existing = plan[key]
    if (existing) {
        let existingName = typeof existing === "string" ? existing : existing.name
        let overwrite = await appConfirm(
            'You already have "' + existingName + '" planned for ' + day + ' ' + mealType + '.\nReplace it with "' + recipe.name + '"?'
        )
        if (!overwrite) {
            showNotification("Kept your existing meal.", "info")
            return
        }
    }

    plan[key] = { name: recipe.name, image: recipe.image }
    localStorage.setItem(getStorageKey('MealPlanner'), JSON.stringify(plan))
    showNotification('Added "' + recipe.name + '" to ' + day + ' ' + mealType, "success")
}

async function openAddToPlanModal(recipe) {
    if (isAnonymousUser()) {
        let confiremd = await appConfirm("please login to add to plan.") 
        if (confiremd) window.location.href = "../html/auth.html"
        return
    }

    document.querySelectorAll(".add-plan-modal-backdrop").forEach(m => m.remove())

    let backdrop = document.createElement("div")
    backdrop.className = "add-plan-modal-backdrop"
    backdrop.innerHTML = `
      <div class="add-plan-modal">
        <h3>Add to Meal Plan</h3>
        <p class="add-plan-sub">Choose a day and meal slot for:</p>
        <p class="add-plan-name">${recipe.name}</p>

        <div class="add-plan-row">
          <label>
            <span>Day</span>
            <select class="add-plan-day">
              ${plannerDays.map(d => '<option value="' + d + '">' + d + '</option>').join("")}
            </select>
          </label>
          <label>
            <span>Meal</span>
            <select class="add-plan-meal">
              ${plannerMealTypes.map(m => '<option value="' + m + '">' + m + '</option>').join("")}
            </select>
          </label>
        </div>

        <div class="add-plan-actions">
          <button type="button" class="add-plan-cancel">Cancel</button>
          <button type="button" class="add-plan-confirm">Add to Plan</button>
        </div>
      </div>
    `

    document.body.appendChild(backdrop)
    document.body.classList.add("modal-open")

    function close() {
        backdrop.remove()
        document.body.classList.remove("modal-open")
    }

    backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop || e.target.classList.contains("add-plan-cancel")) {
            close()
        }
    })

    backdrop.querySelector(".add-plan-confirm").addEventListener("click", () => {
        let day = backdrop.querySelector(".add-plan-day").value
        let mealType = backdrop.querySelector(".add-plan-meal").value

        saveMealToPlanner(day, mealType, recipe)
        close()
    })

    document.addEventListener("keydown", function escHandler(e) {
        if (e.key === "Escape") {
            document.removeEventListener("keydown", escHandler)
            close()
        }
    })
}

function displayRecipes() {
    let recipesContainer = document.getElementById("recipes")
    let recipeTemplate = document.getElementById("card")

    recipesContainer.innerHTML = ""

    let filteredRecipes = allRecipes.filter(shouldShowRecipe)

    document.getElementById("count").textContent =
        'Found ' + filteredRecipes.length + ' recipes out of ' + allRecipes.length + ' total'

    updateFilterSummary()
    updateClearFiltersButton()

    if (filteredRecipes.length === 0) {
        recipesContainer.innerHTML = `
            <div class="no-recipes">
                <p>No recipes found matching your criteria. Try changing your filters or search terms!</p>
            </div>
        `
        return
    }

    filteredRecipes.forEach(recipe => {
        let recipeCard = recipeTemplate.content.cloneNode(true)
        let listItem = recipeCard.querySelector("li")
        listItem.dataset.id = recipe.id

        recipeCard.querySelector("img").src = recipe.image
        recipeCard.querySelector(".badge").textContent = recipe.difficulty
        recipeCard.querySelector(".title").textContent = recipe.name
        recipeCard.querySelector(".desc").textContent = recipe.description

        let metaItems = recipeCard.querySelectorAll(".meta li")
        let totalTime = recipe.prep_time + recipe.cook_time

        metaItems[0].innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                <polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <time>${totalTime} min</time>
        `

        metaItems[1].innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <output>${recipe.calories} cal</output>
        `

        metaItems[2].innerHTML = createStarRating(recipe.rating)

        let tagsContainer = recipeCard.querySelector(".tags")
        tagsContainer.innerHTML = ""

        let rawTags = [recipe.meal_category, recipe.diet_category, ...(recipe.tags || [])]
            .filter(Boolean)
        let seen = new Set()
        let allRecipeTags = []
        rawTags.forEach(tag => {
            let key = String(tag).toLowerCase()
            if (!seen.has(key)) {
                seen.add(key)
                allRecipeTags.push(tag)
            }
        })

        let isMobile = window.matchMedia("(max-width: 640px)").matches
        // console.log(isMobile)
        let maxVisibleTags = isMobile ? 2 : 3

        let visibleTags, hiddenTags
        if (allRecipeTags.length <= maxVisibleTags) {
            visibleTags = allRecipeTags
            hiddenTags = []
        } else {
            visibleTags = allRecipeTags.slice(0, maxVisibleTags -1)
            hiddenTags = allRecipeTags.slice(maxVisibleTags -1)
        }

        visibleTags.forEach(tag => {
            let tagElement = document.createElement("span")
            tagElement.textContent = tag
            tagsContainer.appendChild(tagElement)
        })

        if (hiddenTags.length > 0) {
            let moreButton = document.createElement("span")
            moreButton.className = "more-toggle"
            moreButton.textContent = '+' + hiddenTags.length + ' more'

            moreButton.addEventListener('mousemove', (e) => {
                e.stopPropagation()

                let tagDialog = document.getElementById("tagDialog")
                let tagContent = document.getElementById("tagDialogContent")

                tagContent.innerHTML = ""
                allRecipeTags.forEach(tag => {
                    let tagElement = document.createElement("span")
                    tagElement.textContent = tag
                    tagContent.appendChild(tagElement)
                })
                let rect = moreButton.getBoundingClientRect()
                tagDialog.style.position = "absolute"
                tagDialog.style.top = (rect.bottom + window.scrollY - 20) + 'px'
                tagDialog.style.left = (rect.left + window.scrollX + 80) + 'px'

                tagDialog.show()
            })
            tagsContainer.appendChild(moreButton)
        }

        let hoverButtons = document.createElement("div")
        hoverButtons.className = "hover-icons"

        let quickViewBtn = document.createElement("button")
        quickViewBtn.className = "hover-icon"
        quickViewBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `
        quickViewBtn.title = "Quick View"
        quickViewBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            showRecipeDetails(recipe)
        })

        let addToPlanBtn = document.createElement("button")
        addToPlanBtn.className = "hover-icon"
        addToPlanBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        `
        addToPlanBtn.title = "Add to Meal Plan"
        addToPlanBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            openAddToPlanModal(recipe)
        })

        hoverButtons.appendChild(quickViewBtn)
        hoverButtons.appendChild(addToPlanBtn)
        recipeCard.querySelector(".thumb").appendChild(hoverButtons)

        let footerAddBtn = recipeCard.querySelector(".ghost")
        if (footerAddBtn) {
            footerAddBtn.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                openAddToPlanModal(recipe)
            })
        }

        recipeCard.querySelector(".primary").addEventListener('click', e => {
            e.preventDefault()
            showRecipeDetails(recipe)
        })

        let favoriteBtn = recipeCard.querySelector(".fav")
        favoriteBtn.classList.toggle("active", favoriteRecipes.includes(recipe.id))

        favoriteBtn.addEventListener('click', () => {
            favoriteBtn.classList.toggle("active")

            if (favoriteRecipes.includes(recipe.id)) {
                favoriteRecipes = favoriteRecipes.filter(id => id !== recipe.id)
                showNotification('Removed from favorites', 'info')
            } else {
                favoriteRecipes.push(recipe.id)
                showNotification('Added to favorites!', 'success')
            }

            saveFavorites()
            let filterbyfav = document.getElementById("favoriteFilter").classList.contains("active")
            if (filterbyfav) displayRecipes()
        })

        recipesContainer.appendChild(recipeCard)
    })
}

function showRecipeDetails(recipe) {
    let modal = document.getElementById("modal")

    document.body.classList.add('modal-open')
    modal.showModal()

    document.getElementById("mTitle").textContent = recipe.name
    document.getElementById("mDesc").textContent = recipe.description

    let modalImage = document.getElementById("mImg")
    modalImage.src = recipe.image
    modalImage.alt = recipe.name

    modalImage.onerror = () => {
        modalImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%2394a3b8">No Image Available</text></svg>'
    }

    let totalTime = recipe.prep_time + recipe.cook_time
    document.getElementById("mTime").textContent = totalTime + " min"
    document.getElementById("mCal").textContent = recipe.calories + " cal"
    document.getElementById("mServ").textContent = recipe.servings + " servings"
    document.getElementById("mServingsCount").textContent = recipe.servings

    let ratingEl = document.getElementById("mRating")
    if (ratingEl) {
        let ratingNumber = Number(recipe.rating)
        let ratingDisplay = Number.isFinite(ratingNumber)
            ? ratingNumber.toFixed(1)
            : (recipe.rating || "—")
        ratingEl.textContent = ratingDisplay + " ★"
    }

    let viewsEl = document.getElementById("mViews")
    if (viewsEl) {
        let views = recipe.views
        if (typeof views === "number" && typeof views.toLocaleString === "function") {
            viewsEl.textContent = views.toLocaleString()
        } else {
            viewsEl.textContent = views || "—"
        }
    }

    let mealEl = document.getElementById("mMeal")
    if (mealEl) mealEl.textContent = recipe.meal_category || "—"

    let dietEl = document.getElementById("mDiet")
    if (dietEl) dietEl.textContent = recipe.diet_category || "—"

    let diffEl = document.getElementById("mDiff")
    if (diffEl) diffEl.textContent = recipe.difficulty || "—"

    let protEl = document.getElementById("mProt")
    if (protEl && recipe.protein != null) protEl.textContent = recipe.protein + " g"

    let carbsEl = document.getElementById("mCarbs")
    if (carbsEl && recipe.carbs != null) carbsEl.textContent = recipe.carbs + " g"

    let fatEl = document.getElementById("mFat")
    if (fatEl && recipe.fat != null) fatEl.textContent = recipe.fat + " g"

    let microsList = document.getElementById("mMicros")
    if (microsList) {
        microsList.innerHTML = ""
        if (recipe.micronutrients) {
            Object.entries(recipe.micronutrients).forEach(([key, value]) => {
                let li = document.createElement("li")
                let label = key.replace(/([A-Z])/g, " $1")
                label = label.charAt(0).toUpperCase() + label.slice(1)
                li.textContent = label + ':   ' + value
                microsList.appendChild(li)
            })
        }
    }

    let modalTags = document.getElementById("mTags")
    if (modalTags) {
        modalTags.innerHTML = ""
        let allTags = [recipe.meal_category, recipe.diet_category, ...(recipe.tags || [])]
            .filter(Boolean)
        allTags.forEach(tag => {
            let span = document.createElement("span")
            span.textContent = tag
            modalTags.appendChild(span)
        })
    }

    let ingredientsList = document.getElementById("mIngr")
    ingredientsList.innerHTML = ""

    recipe.ingredients.forEach(ingredient => {
        let li = document.createElement("li")
        li.textContent = ingredient

        li.addEventListener('click', function () {
            this.classList.toggle('checked')
        })

        ingredientsList.appendChild(li)
    })

    let instructionsList = document.getElementById("mInstr")
    instructionsList.innerHTML = ""

    if (recipe.instructions && recipe.instructions.length > 0) {
        recipe.instructions.forEach(instruction => {
            let li = document.createElement("li")

            let instructionText = document.createElement("div")
            instructionText.className = "instruction-text"
            instructionText.textContent = instruction

            li.appendChild(instructionText)
            instructionsList.appendChild(li)
        })
    } else {
        let li = document.createElement("li")
        let instructionText = document.createElement("div")
        instructionText.className = "instruction-text"
        instructionText.textContent = "No specific instructions provided. Use your best judgment for preparation!"
        instructionText.style.fontStyle = "italic"
        instructionText.style.color = "#64748b"

        li.appendChild(instructionText)
        instructionsList.appendChild(li)
    }

    document.getElementById("mClose").onclick = () => {
        modal.close()
        document.body.classList.remove('modal-open')
    }

    let saveBtn = document.querySelector(".save-btn")
    let modalFav = document.querySelector(".modal-fav")
    let isCurrentlySaved = favoriteRecipes.includes(recipe.id)

    function updateFavoriteUI(isSaved) {
        if (saveBtn) {
            if (isSaved) {
                saveBtn.innerHTML =
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Saved'
                saveBtn.style.background = "#dcfce7"
                saveBtn.style.borderColor = "#16a34a"
                saveBtn.style.color = "#166534"
            } else {
                saveBtn.innerHTML =
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save Recipe'
                saveBtn.style.background = "white"
                saveBtn.style.borderColor = "#e2e8f0"
                saveBtn.style.color = "#475569"
            }
        }

        if (modalFav) {
            modalFav.classList.toggle("active", isSaved)
            modalFav.innerHTML = isSaved ? "&#9829" : "&#9825"
        }

        let cardFavoriteBtn = document.querySelector('[data-id="' + recipe.id + '"] .fav')
        if (cardFavoriteBtn) {
            cardFavoriteBtn.classList.toggle("active", isSaved)
        }
    }

    updateFavoriteUI(isCurrentlySaved)

    function toggleFavorite() {
        let isSaved = favoriteRecipes.includes(recipe.id)

        if (isSaved) {
            favoriteRecipes = favoriteRecipes.filter(id => id !== recipe.id)
            showNotification('Removed from favorites', 'info')
        } else {
            favoriteRecipes.push(recipe.id)
            showNotification('Added to favorites!', 'success')
        }

        saveFavorites()
        updateFavoriteUI(!isSaved)
    }

    if (saveBtn) {
        saveBtn.onclick = toggleFavorite
    }

    if (modalFav) {
        modalFav.onclick = (e) => {
            e.stopPropagation()
            toggleFavorite()
        }
    }

    let shareBtn = document.querySelector(".share-btn")
    shareBtn.onclick = async () => {
        let shareData = {
            title: recipe.name,
            text: recipe.description,
            url: window.location.href,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)

                let originalHTML = shareBtn.innerHTML
                shareBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!'
                shareBtn.style.background = "#dcfce7"
                shareBtn.style.borderColor = "#16a34a"
                shareBtn.style.color = "#166534"
                showNotification('Link copied to clipboard!', 'success')

                setTimeout(() => {
                    shareBtn.innerHTML = originalHTML
                    shareBtn.style.background = "white"
                    shareBtn.style.borderColor = "#e2e8f0"
                    shareBtn.style.color = "#475569"
                }, 2000)
            }
        } catch (err) {
            console.log('Sharing failed:', err)
            showNotification('Failed to share recipe', 'error')
        }
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.close()
            document.body.classList.remove('modal-open')
        }
    })

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.close()
            document.body.classList.remove('modal-open')
        }
    })

    modal.addEventListener('close', () => {
        document.body.classList.remove('modal-open')
    })
}

function setupFilters() {
    let mealTypes = [...new Set(allRecipes.map(recipe => recipe.meal_category))].sort()
    let dietTypes = [...new Set(allRecipes.map(recipe => recipe.diet_category))].sort()
    let difficultyLevels = [...new Set(allRecipes.map(recipe => recipe.difficulty))].sort()

    let mealDropdown = document.querySelectorAll('.dd-panel')[0]
    mealDropdown.innerHTML = mealTypes.map(meal =>
        '<button class="dd-item">' + meal + '</button>'
    ).join('')

    let dietDropdown = document.querySelectorAll('.dd-panel')[1]
    dietDropdown.innerHTML = dietTypes.map(diet =>
        '<button class="dd-item">' + diet + '</button>'
    ).join('')

    let difficultyDropdown = document.querySelectorAll('.dd-panel')[2]
    difficultyDropdown.innerHTML = difficultyLevels.map(level =>
        '<button class="dd-item">' + level + '</button>'
    ).join('')
}

function toggleFavoriteFilter() {
    let favoriteFilterBtn = document.getElementById('favoriteFilter')
    // console.log("abl",currentFilters.favoritesOnly)

    currentFilters.favoritesOnly = !currentFilters.favoritesOnly
    // console.log("ba3d",currentFilters.favoritesOnly)
    favoriteFilterBtn.classList.toggle("active", currentFilters.favoritesOnly)

    if (currentFilters.favoritesOnly) {
        document.querySelectorAll(".quick-pill").forEach(btn => {
            if (btn !== favoriteFilterBtn) {
                btn.classList.remove("active")
            }
        })

        currentFilters.quickFilter = null

        let favoriteCount = favoriteRecipes.length
        if (favoriteCount > 0) {
            showNotification('Showing ' + favoriteCount + ' favorite recipes', 'success')
        } else {
            showNotification('No favorite recipes yet!', 'info')
        }
    } else {
        showNotification('Showing all recipes', 'info')
    }

    displayRecipes()
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove())
    let notification = document.createElement('div')
    notification.className = 'notification notification-' + type
    notification.textContent = message

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
    `

    let backgroundColor = '#16a34a'
    if (type === 'error') backgroundColor = '#dc2626'
    if (type === 'info') backgroundColor = '#2563eb'
    if (type === 'warning') backgroundColor = '#d97706'

    notification.style.background = backgroundColor

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

let notificationStyles = document.createElement('style')
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateY(100%); opacity: 0 }
        to { transform: translateY(0); opacity: 1 }
    }
    @keyframes slideOut {
        from { transform: translateY(0); opacity: 1 }
        to { transform: translateY(100%); opacity: 0 }
    }
`
document.head.appendChild(notificationStyles)

document.addEventListener("click", event => {
    if (event.target.classList.contains("dd-btn")) {
        let dropdownPanel = event.target.nextElementSibling

        document.querySelectorAll(".dd-panel").forEach(panel => {
            if (panel !== dropdownPanel) panel.style.display = "none"
        })

        dropdownPanel.style.display = dropdownPanel.style.display === "block" ? "none" : "block"
        return
    }

    if (event.target.classList.contains("dd-item")) {
        let dropdownPanel = event.target.closest(".dd-panel")
        let dropdownButton = event.target.closest(".dd-box").querySelector(".dd-btn")
        let dropdownLabel = dropdownButton.textContent.trim()
        let selectedValue = event.target.textContent.trim()
        let allItems = dropdownPanel.querySelectorAll(".dd-item")

        if (dropdownLabel.includes("Meal")) {
            if (currentFilters.mealType === selectedValue) {
                currentFilters.mealType = null
                allItems.forEach(item => item.classList.remove("active"))
            } else {
                currentFilters.mealType = selectedValue
                allItems.forEach(item => item.classList.toggle("active", item === event.target))
            }
        }
        else if (dropdownLabel.includes("Diet")) {
            if (currentFilters.dietTypes.includes(selectedValue)) {
                currentFilters.dietTypes = currentFilters.dietTypes.filter(item => item !== selectedValue)
                event.target.classList.remove("active")
            } else {
                currentFilters.dietTypes.push(selectedValue)
                event.target.classList.add("active")
            }
        }
        else if (dropdownLabel.includes("Difficulty") || dropdownLabel.includes("Time")) {
            if (currentFilters.difficulty === selectedValue) {
                currentFilters.difficulty = null
                allItems.forEach(item => item.classList.remove("active"))
            } else {
                currentFilters.difficulty = selectedValue
                allItems.forEach(item => item.classList.toggle("active", item === event.target))
            }
        }

        document.querySelectorAll(".dd-panel").forEach(panel => panel.style.display = "none")
        displayRecipes()
        return
    }

    if (!event.target.closest(".dd-box")) {
        document.querySelectorAll(".dd-panel").forEach(panel => panel.style.display = "none")
    }
})

document.querySelectorAll(".quick-pill").forEach(button => {
    // fav filter btn 3nda kameen .quick-pill class so aam tnzeed 2 times
    if (button.id === "favoriteFilter") return //return eza l btn favfilter
    
    button.addEventListener('click', () => {
        document.querySelectorAll(".quick-pill").forEach(btn => btn.classList.remove("active"))

        let filterValue = button.textContent.trim()

        if (currentFilters.quickFilter === filterValue) {
            currentFilters.quickFilter = null
        } else {
            currentFilters.quickFilter = filterValue
            button.classList.add("active")
        }

        displayRecipes()
    })
})

let debouncedDisplayRecipes = debounce(displayRecipes, 300)
document.getElementById("searchInput").addEventListener('input', event => {
    let raw = event.target.value.trim().toLowerCase()
    let hasComma = raw.includes(",")

    if (hasComma) {
        currentFilters.ingredients = raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)

        currentFilters.search = ""
    }
    else {
        currentFilters.search = raw.trim()
        currentFilters.ingredients = []
    }
    debouncedDisplayRecipes()
})

document.addEventListener('mousemove', (e) => {
    let tagDialog = document.getElementById('tagDialog')
    if (!tagDialog || !tagDialog.open) return

    let overDialog = e.target.closest('#tagDialog')
    let overToggle = e.target.closest('.more-toggle')

    if (!overDialog && !overToggle) {
        tagDialog.close()
    }
})

function hasActiveFilters() {
    return currentFilters.search !== "" ||
        currentFilters.mealType !== null ||
        currentFilters.dietTypes.length > 0 ||
        currentFilters.difficulty !== null ||
        currentFilters.quickFilter !== null ||
        currentFilters.ingredients.length > 0 ||
        currentFilters.favoritesOnly
}

function updateClearFiltersButton() {
    let filterActions = document.getElementById('filterActions')

    if (hasActiveFilters()) {
        filterActions.style.display = 'flex'
        filterActions.style.animation = 'fadeInUp 0.3s ease-out'
    } else {
        filterActions.style.display = 'none'
    }
}

function clearAllFilters() {
    currentFilters = {
        search: "",
        mealType: null,
        dietTypes: [],
        difficulty: null,
        quickFilter: null,
        ingredients: [],
        favoritesOnly: false
    }

    document.getElementById("searchInput").value = ""

    document.querySelectorAll(".quick-pill").forEach(btn => {
        btn.classList.remove("active")
    })

    document.querySelectorAll(".dd-item").forEach(item => {
        item.classList.remove("active")
    })

    document.querySelectorAll(".dd-panel").forEach(panel => {
        panel.style.display = "none"
    })

    updateClearFiltersButton()

    displayRecipes()

    showNotification('All filters cleared', 'info')
}

document.addEventListener('DOMContentLoaded', function () {
    let favoriteFilterBtn = document.getElementById('favoriteFilter')
    if (favoriteFilterBtn) {
        favoriteFilterBtn.addEventListener('click', toggleFavoriteFilter)
    }

    let clearFiltersBtn = document.getElementById('clearFilters')
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters)
    }
})

initializeApp()