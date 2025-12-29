let who = document.getElementById('who') 
let form = document.getElementById('form') 

let nameEl = document.getElementById('name'), imageEl = document.getElementById('image'), descriptionEl = document.getElementById('description') 
let prepEl = document.getElementById('prep_time'), cookEl = document.getElementById('cook_time'), servingsEl = document.getElementById('servings') 
let calEl = document.getElementById('calories'), protEl = document.getElementById('protein'), carbEl = document.getElementById('carbs'), fatEl = document.getElementById('fat') 
let tagsEl = document.getElementById('tags'), diffEl = document.getElementById('difficulty'), mealCatEl = document.getElementById('meal_category'), dietCatEl = document.getElementById('diet_category') 
let ingEl = document.getElementById('ingredients'), instEl = document.getElementById('instructions') 
let fiberEl = document.getElementById('fiber'), sodiumEl = document.getElementById('sodium'), vitCEl = document.getElementById('vitaminC'), extraMicroEl = document.getElementById('extraMicro') 

let pTitle = document.getElementById('pTitle'), pDesc = document.getElementById('pDesc'), pTime = document.getElementById('pTime'), pKcal = document.getElementById('pKcal'), pTags = document.getElementById('pTags') 
let pMedia = document.getElementById('pMedia'), pPH = document.getElementById('pPH') 


let addTitle = document.getElementById('addTitle')
let saveBtn  = document.querySelector('button.primary[form="form"]')
let editingId = null

function resetEditMode() {
  editingId = null
  if (addTitle) addTitle.textContent = 'Add a Recipe'
  if (saveBtn)  saveBtn.textContent  = 'Save to My Recipes'
}
resetEditMode() //la nshte8el aa ndeef

function startEdit(recipe) {
  if (!recipe) return

  editingId = recipe.id

  if (addTitle) addTitle.textContent = 'Edit Recipe'
  if (saveBtn)  saveBtn.textContent  = 'Update Recipe'

  // clear old errors
  validatableFields.forEach(f => f && clearFieldError(f))

  // fill basic fields
  nameEl.value        = recipe.name || ''
  imageEl.value       = recipe.image || ''
  descriptionEl.value = recipe.description || ''

  prepEl.value     = recipe.prep_time ?? 0
  cookEl.value     = recipe.cook_time ?? 0
  servingsEl.value = recipe.servings ?? 1

  calEl.value  = recipe.calories ?? 0
  protEl.value = recipe.protein ?? 0
  carbEl.value = recipe.carbs ?? 0
  fatEl.value  = recipe.fat ?? 0

  diffEl.value      = recipe.difficulty || 'Easy'
  mealCatEl.value   = recipe.meal_category || 'Breakfast'
  dietCatEl.value   = recipe.diet_category || 'Vegetarian'

  ingEl.value  = Array.isArray(recipe.ingredients)  ? recipe.ingredients.join('\n')  : ''
  instEl.value = Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : ''
  tagsEl.value = Array.isArray(recipe.tags) ? recipe.tags.join(', ') : ''

  // micronutrients back into the four fields
  let micro = recipe.micronutrients || {}
  fiberEl.value   = micro.fiber ?? ''
  sodiumEl.value  = micro.sodium ?? ''
  vitCEl.value    = micro.vitaminC ?? ''

  // anything left over goes into extraMicro as JSON
  let extra = { ...micro }
  delete extra.fiber
  delete extra.sodium
  delete extra.vitaminC
  extraMicroEl.value = Object.keys(extra).length ? JSON.stringify(extra) : ''

  // optionally scroll to form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' })
}


function currentUserId(){
    let id = sessionStorage.getItem('userId')
    if (!id) {
        console.log('No userId in sessionStorage. Using anonymous mode.')
        return 'anonymous'
    }
    return id
}
let curId = currentUserId()

async function getUser(userid) {
  let res = await fetch("../js/data.json")
  let data = await res.json()

  let users = data.users || []
  let user  = users.find(u => String(u.id) === String(userid))

  return user?.username || userid
}

getUser(curId).then(username => {
  who.textContent = `Welcome ${username} !`
})

let KEY = "MyRecipes"
let userKEY = `${curId}: ${KEY}`

function isAnonymousUser() {
  return curId === 'anonymous'
}

let storedRecipes = isAnonymousUser()
  ? sessionStorage.getItem(userKEY)
  : localStorage.getItem(userKEY)

let myRecipes = JSON.parse(storedRecipes || "[]")

function save(){ 
  if (isAnonymousUser()) {
    sessionStorage.setItem(userKEY, JSON.stringify(myRecipes)) 
  } else {
    localStorage.setItem(userKEY, JSON.stringify(myRecipes)) 
  }
}

function ensureErrorContainer(field) {
  let label = field.closest('label')
  if (!label) return null

  let err = label.querySelector('.field-error')
  if (!err) {
    err = document.createElement('div')
    err.className = 'field-error'
    label.appendChild(err)
  }
  return err
}

function showFieldError(field, message) {
  let err = ensureErrorContainer(field)
  if (!err) return
  field.classList.add('invalid')
  field.setAttribute('aria-invalid', 'true')
  err.textContent = message
}

function clearFieldError(field) {
  let label = field.closest('label')
  if (!label) return
  let err = label.querySelector('.field-error')
  if (err) err.textContent = ''
  field.classList.remove('invalid')
  field.removeAttribute('aria-invalid')
}

function isValidUrl(str) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function validateField(field) {
  let id = field.id
  let raw = field.value
  let value = raw.trim()

  clearFieldError(field)

  switch (id) {
    case 'name':
      if (!value) {
        showFieldError(field, 'Name is required.')
      } else if (value.length < 3) {
        showFieldError(field, 'Name should be at least 3 characters.')
      }
      break

    case 'description':
      if (!value) {
        showFieldError(field, 'Description is required.')
      } else if (value.length < 10) {
        showFieldError(field, 'Description should be at least 10 characters.')
      }
      break

    case 'ingredients':
      if (!value) {
        showFieldError(field, 'Add at least one ingredient.')
      }
      break

    case 'instructions':
      if (!value) {
        showFieldError(field, 'Add at least one step.')
      }
      break

    case 'image':
      if (value && !isValidUrl(value)) {
        showFieldError(field, 'Please enter a valid image URL.')
      }
      break

    case 'servings': {
      let n = +raw
      if (!raw || isNaN(n) || n < 1) {
        showFieldError(field, 'Servings must be at least 1.')
      }
      break
    }

    case 'prep_time':
    case 'cook_time':
    case 'calories':
    case 'protein':
    case 'carbs':
    case 'fat':
    case 'fiber':
    case 'sodium': {
      if (raw !== '') {
        let n = +raw
        if (isNaN(n) || n < 0) {
          showFieldError(field, 'Value cannot be negative.')
        }
      }
      break
    }

    case 'extraMicro':
      if (value) {
        try {
          JSON.parse(value)
        } catch {
          showFieldError(field, 'Must be valid JSON, e.g. {"iron":"3mg"}.')
        }
      }
      break
  }
}

let validatableFields = [
  nameEl,
  descriptionEl,
  ingEl,
  instEl,
  imageEl,
  prepEl,
  cookEl,
  servingsEl,
  calEl,
  protEl,
  carbEl,
  fatEl,
  fiberEl,
  sodiumEl,
  extraMicroEl
]

validatableFields.forEach(f => {
  if (!f) return
  f.addEventListener('blur', () => validateField(f))
  f.addEventListener('input', () => clearFieldError(f))
})

let grid = document.querySelector('.grid')

function render(){
    grid.innerHTML = ""

    myRecipes.forEach(r => {

        let card = document.createElement('article')
        card.className = 'card'

        let media = document.createElement('div')
        media.className = 'media'
        if (r.image) {
            let img = new Image()
            img.src = r.image
            img.alt = r.name || ''
            img.style.maxWidth = '100%'
            img.style.maxHeight = '100%'
            img.style.objectFit = 'cover'
            media.appendChild(img)
        } else {
            let ph = document.createElement('div')
            ph.className = 'placeholder'
            ph.textContent = placeholderInitials(r.name)
            media.appendChild(ph)
        }

        let body = document.createElement('div')
        body.className = 'body'

        let h3 = document.createElement('h3')
        h3.textContent = r.name || '—'

        let meta = document.createElement('div')
        meta.className = 'meta'
        let totalMin = (r.prep_time||0) + (r.cook_time||0)
        meta.textContent = `${totalMin}m • ${r.calories||0} kcal`

        let p = document.createElement('p')
        p.style.margin = '0'
        p.textContent = r.description || ''

        let footer = document.createElement('div')
        footer.style.marginTop = '8px'
        let viewBtn = document.createElement('button')
        viewBtn.type = 'button'
        viewBtn.textContent = 'View'
        viewBtn.setAttribute('data-action', 'view')
        viewBtn.setAttribute('data-id', String(r.id))

        viewBtn.addEventListener("click", ()=> open(r) ) 

        let editBtn = document.createElement('button')
        editBtn.type = 'button'
        editBtn.textContent = 'Edit'
        editBtn.setAttribute('data-action', 'edit')
        editBtn.setAttribute('data-id', String(r.id))
        editBtn.style.marginLeft = '8px'
        editBtn.addEventListener('click', () => startEdit(r))

        footer.appendChild(viewBtn)
        footer.appendChild(editBtn)
        body.append(h3, meta, p, footer)
        card.append(media, body)

        grid.appendChild(card)
    })
}

let modal = document.getElementById('modal')
let mTitle = document.getElementById('mTitle')
let mImg = document.getElementById('mImg')
let mDesc = document.getElementById('mDesc')
let mMeta = document.getElementById('mMeta')
let mBody = document.querySelector('#modal .modal-body, #modal .content')

function open(recipe){
    mTitle.textContent = recipe.name || 'Recipe Details'
    mDesc.textContent  = recipe.description || ''

    if (recipe.image) {
        mImg.src = recipe.image
        mImg.alt = recipe.name || ''
        mImg.style.display = ''
    } else {
        mImg.removeAttribute('src')
        mImg.alt = ''
        mImg.style.display = 'none'
    }

    let mins = (recipe.prep_time||0) + (recipe.cook_time||0)
    let parts = [
        `${mins}m`,
        recipe.difficulty,
        recipe.servings ? `${recipe.servings} serving${recipe.servings>1?'s':''}` : null,
        (recipe.calories!=null) ? `${recipe.calories} kcal` : null,
        [recipe.protein, 'g protein'],
        [recipe.carbs, 'g carbs'],
        [recipe.fat, 'g fat']
    ].map(x => Array.isArray(x) ? (x[0]!=null ? `${x[0]} ${x[1]}` : null) : x)
    .filter(Boolean)
    mMeta.textContent = parts.join(' • ')

    modal.setAttribute('aria-hidden', 'false')
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'

    let totalMin = (recipe.prep_time||0) + (recipe.cook_time||0)

    mBody.innerHTML = `
    ${recipe.image ? `
        <img id="mImg" src="${recipe.image}" alt="${recipe.name||''}" />
    ` : ''}

    <div class="modal-body-inner">
        ${recipe.description ? `<p id="mDesc">${recipe.description}</p>` : ''}

        <div id="mMeta">
        ${[`${totalMin}m`,
            recipe.difficulty || null,
            recipe.servings ? `${recipe.servings} serving${recipe.servings>1?'s':''}` : null,
            (recipe.calories!=null) ? `${recipe.calories} kcal` : null,
            (recipe.protein!=null) ? `${recipe.protein} g protein` : null,
            (recipe.carbs!=null)   ? `${recipe.carbs} g carbs`   : null,
            (recipe.fat!=null)     ? `${recipe.fat} g fat`       : null
            ].filter(Boolean).join(' • ')}
        </div>

        <div id="mDetails" class="details-grid">

        ${(recipe.prep_time!=null || recipe.cook_time!=null) ? `
        <section class="msec">
            <h4>Time</h4>
            <dl class="kv">
            ${recipe.prep_time!=null ? `<dt>Prep</dt><dd>${recipe.prep_time} min</dd>` : ''}
            ${recipe.cook_time!=null ? `<dt>Cook</dt><dd>${recipe.cook_time} min</dd>` : ''}
            <dt>Total</dt><dd>${totalMin} min</dd>
            </dl>
        </section>` : ''}

        ${(recipe.calories!=null || recipe.protein!=null || recipe.carbs!=null || recipe.fat!=null || recipe.servings!=null || recipe.difficulty) ? `
        <section class="msec">
            <h4>Nutrition</h4>
            <dl class="kv">
            ${recipe.calories!=null ? `<dt>Calories</dt><dd>${recipe.calories} kcal</dd>` : ''}
            ${recipe.protein!=null  ? `<dt>Protein</dt><dd>${recipe.protein} g</dd>`     : ''}
            ${recipe.carbs!=null    ? `<dt>Carbs</dt><dd>${recipe.carbs} g</dd>`         : ''}
            ${recipe.fat!=null      ? `<dt>Fat</dt><dd>${recipe.fat} g</dd>`             : ''}
            ${recipe.servings!=null ? `<dt>Servings</dt><dd>${recipe.servings}</dd>`     : ''}
            ${recipe.difficulty     ? `<dt>Difficulty</dt><dd>${recipe.difficulty}</dd>` : ''}
            </dl>
        </section>` : ''}

        ${Array.isArray(recipe.ingredients) && recipe.ingredients.length ? `
        <section class="msec">
            <h4>Ingredients</h4>
            <ul class="bullets">
            ${recipe.ingredients.map(x => `<li>${x}</li>`).join('')}
            </ul>
        </section>` : ''}

        ${(Array.isArray(recipe.steps) && recipe.steps.length) || (Array.isArray(recipe.instructions) && recipe.instructions.length) ? `
        <section class="msec">
            <h4>Steps</h4>
            <ol class="steps">
            ${(recipe.steps || recipe.instructions).map(x => `<li>${x}</li>`).join('')}
            </ol>
        </section>` : ''}

        ${Array.isArray(recipe.tags) && recipe.tags.length ? `
        <section class="msec">
            <h4>Tags</h4>
            <div class="chips">
            ${recipe.tags.map(x => `<span class="chip">${x}</span>`).join('')}
            </div>
        </section>` : ''}

        ${recipe.source_url ? `
        <section class="msec">
            <h4>Source</h4>
            <a href="${recipe.source_url}" target="_blank" rel="noopener">Open source recipe</a>
        </section>` : ''}

        </div>
    </div>
    `
}

modal.addEventListener('click', (e)=>{
  if (e.target.matches('[data-close]') || e.target.hasAttribute('data-close')) {
    modal.setAttribute('aria-hidden', 'true')
    modal.classList.remove('open')
    document.body.style.overflow = ''
  }
})

function placeholderInitials(s){
    return (String(s||'').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()) || 'R'
}

// reset
document.getElementById('resetForm').addEventListener('click', async () => {
    if(await appConfirm("clear all your customized recipes?")){
        myRecipes = []
        save()
        render() 

        validatableFields.forEach(f => {
          if (!f) return
          clearFieldError(f)
        })

        form.reset()
        resetEditMode()
    }
})

function createRecipe(existingId){
    let  ingredients = (ingEl.value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean)
    let  instructions = (instEl.value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean)
    let  tags = (tagsEl.value||'').split(',').map(s=>s.trim()).filter(Boolean)

    let  micronutrients = {}
    if(fiberEl.value) micronutrients.fiber = +fiberEl.value
    if(sodiumEl.value) micronutrients.sodium = +sodiumEl.value
    if(vitCEl.value) micronutrients.vitaminC = vitCEl.value
    if(extraMicroEl.value){
      try{ Object.assign(micronutrients, JSON.parse(extraMicroEl.value)) }catch{}
    }

    let id =  existingId ?? (Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000)

    return {
        id,
        name: nameEl.value.trim(),
        image: imageEl.value.trim(),
        description: descriptionEl.value.trim(),
        ingredients,
        instructions,
        rating: 0,
        views: 0,
        prep_time: +prepEl.value||0,
        cook_time: +cookEl.value||0,
        servings: +servingsEl.value||1,
        calories: +calEl.value||0,
        protein: +protEl.value||0,
        carbs: +carbEl.value||0,
        fat: +fatEl.value||0,
        micronutrients,
        tags,
        difficulty: diffEl.value,
        meal_category: mealCatEl.value,
        diet_category: dietCatEl.value
    }
}

form.addEventListener('submit', async e=>{
    e.preventDefault()

    validatableFields.forEach(f => f && validateField(f))

    let firstError = form.querySelector('.invalid')
    if (firstError) {
        firstError.focus()
        return
    }

    //check if we are editing an existing recipe
    let idx = (editingId != null)
      ? myRecipes.findIndex(r => r.id === editingId)
      : -1

    // if idx >= 0 we reuse the existing id; otherwise new recipe
    let recipe = createRecipe(idx >= 0 ? editingId : undefined)
    if (idx >= 0) myRecipes[idx] = recipe        // update existing
    else myRecipes.push(recipe)         // create new

    save()
    render()
    await appConfirm(idx >= 0
        ? 'Recipe updated in My Recipes for this user.'
        : 'Saved to My Recipes for this user.', true)

    form.reset() 
    validatableFields.forEach(f => f && clearFieldError(f))
    resetEditMode() //dayman mnshte8e aa ndeef n7na
})

document.addEventListener('DOMContentLoaded',render)
