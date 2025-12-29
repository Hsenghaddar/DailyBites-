let hamburger = document.querySelector('.hamburger')
let navLinks = document.querySelector('.nav-links')
let navActions = document.querySelector('.nav-actions')
let navInner = document.querySelector(".nav-inner")
let breakpoint = 992

let head =document.querySelector("head")
let icon = document.createElement('link')
icon.rel = 'icon'
icon.type = 'image/png'
icon.href = '../assets/plate.png'
head.append(icon)

function toggleMenu() {
  let isOpen = navLinks.classList.contains('open')
  // if (!isOpen) {
  //     navLinks.appendChild(navActions)
  // } else {
  //     // move back to normal place on close
  //     let navRow = document.getElementById('nav-desc')
  //     navRow.appendChild(navActions)
  // }
  // navLinks.classList.toggle('open')
  // document.body.classList.toggle('no-scroll')

  // hamburger.setAttribute('aria-expanded', String(!isOpen))
  // hamburger.classList.add('open-anim') setTimeout(() => hamburger.classList.remove('open-anim'), 260)

  if (!isOpen) {
    // OPEN
    navLinks.appendChild(navActions)
    navLinks.classList.add('open')                 // show first so CSS can animate
    document.body.classList.add('no-scroll')
    hamburger.setAttribute('aria-expanded', 'true')

    // tiny pop on the icon
    hamburger.classList.add('open-anim')
    setTimeout(() => hamburger.classList.remove('open-anim'), 380) // ~ --dur-md
    return
  }

  // CLOSE (delegate to the animated closer)
  closeMenu()
}
let authBtn = document.querySelector('.nav-actions a')
let userId = sessionStorage.getItem('userId')

if (authBtn) {
  if (userId) {
    authBtn.textContent = 'Logout'
    authBtn.classList.add('logout-btn')
    authBtn.href = './../html/auth.html'

    authBtn.addEventListener('click', (e) => {
      e.preventDefault()
      sessionStorage.removeItem('userId')
      authBtn.textContent = 'Login'
      authBtn.classList.remove('logout-btn')
      authBtn.href = './../html/auth.html'
      location.reload()
    })
  } else {
    authBtn.textContent = 'Login'
    authBtn.classList.remove('logout-btn')
    authBtn.href = './../html/auth.html'
  }
}
function closeMenu({ instant = false } = {}) {
  // navLinks.classList.remove('open')
  // document.body.classList.remove('no-scroll')
  // let navRow = document.getElementById('nav-desc')
  // if (navActions.parentNode !== navRow) navRow.appendChild(navActions)
  // hamburger.setAttribute('aria-expanded', 'false')
  if (!navLinks.classList.contains('open')) return

  // If we're on desktop or explicitly asked to, reset instantly (no animation)
  if (instant || window.innerWidth > breakpoint) {
    navLinks.classList.remove('closing')
    navLinks.classList.remove('open')
    document.body.classList.remove('no-scroll')
    hamburger.setAttribute('aria-expanded', 'false')

    let navRow = document.getElementById('nav-desc')
    if (navRow && navActions.parentNode !== navRow) navInner.appendChild(navActions)
    return
  }

  // run the closing keyframes (mobile)
  navLinks.classList.add('closing')
  hamburger.setAttribute('aria-expanded', 'false')

  navLinks.addEventListener('animationend', function handler() {
    navLinks.removeEventListener('animationend', handler)
    navLinks.classList.remove('closing')
    navLinks.classList.remove('open')
    document.body.classList.remove('no-scroll')

    // move actions back after it fully closes
    let navRow = document.getElementById('nav-desc')
    if (navActions.parentNode !== navRow) navInner.appendChild(navActions)
  }, { once: true })
}

hamburger.addEventListener('click', toggleMenu)

window.addEventListener('resize', () => {
  if (window.innerWidth > breakpoint) {
    // When jumping to desktop, force menu back to normal state
    closeMenu({ instant: true })
  }
})

document.addEventListener('click', (e) => {
  if (!e.target.closest('nav') && window.innerWidth <= breakpoint) closeMenu()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu()
    hamburger.setAttribute('aria-expanded', 'false') // keep ARIA honest
  }
})

// Smooth scroll for same-page anchors across the site
document.addEventListener('click', (e) => {
  let a = e.target.closest('a[href^="#"]')
  if (!a) return
  let id = a.getAttribute('href')
  if (!id || id === '#') return
  let el = document.querySelector(id)
  if (!el) return
  e.preventDefault()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

// Intersection-based reveal utility
let revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('is-inview')
      revealObserver.unobserve(en.target)
    }
  })
}, { threshold: 0.08 })
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el))

// pop up confirm notification
window.appConfirm = async function appConfirm(message, okOnly = false) {
  // create dialog once
  if (!appConfirm.dialog) {
    let dlg = document.createElement("dialog")
    dlg.innerHTML = `
      <form method="dialog" class="mini-confirm">
        <p></p>
        <menu>
          <button value="cancel">Cancel</button>
          <button value="ok">OK</button>
        </menu>
      </form>
    `
    document.body.appendChild(dlg)

    appConfirm.dialog  = dlg
    appConfirm.text  = dlg.querySelector("p")
    appConfirm.cancelBtn = dlg.querySelector('button[value="cancel"]')
  }

  appConfirm.text.textContent = message

  // show / hide Cancel depending on okOnly
  if (okOnly) {
    appConfirm.cancelBtn.style.display = "none"
  } else {
    appConfirm.cancelBtn.style.display = ""
  }

  appConfirm.dialog.showModal()

  return new Promise((resolve) => {
    appConfirm.dialog.onclose = () => {
      if (okOnly) {
        // in alert mode, just resolve true (there is only OK anyway)
        resolve(true)
      } else {
        resolve(appConfirm.dialog.returnValue === "ok")
      }
    }
  })
}

// ===== Modal System =====
// Expected HTML:
// <div class="overlay" id="overlay"></div>
// <div class="modal" id="modal">
//   <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
//     <div class="modal__header">
//       <h3 id="modal-title">Title</h3>
//       <button class="modal__close" aria-label="Close">&times</button>
//     </div>
//     <div class="modal__body"></div>
//   </div>
// </div>

let overlayEl = document.getElementById('overlay')
let modalEl = document.getElementById('modal')
let modalBody = modalEl ? modalEl.querySelector('.modal__body') : null

window.openModal = function openModal({ title = '', html = '' } = {}) {
  if (!overlayEl || !modalEl) return
  let titleEl = modalEl.querySelector('#modal-title')
  if (titleEl) titleEl.textContent = title
  if (modalBody) modalBody.innerHTML = html
  overlayEl.classList.add('is-open')
  modalEl.classList.add('is-open')
  document.body.classList.add('no-scroll')
}

window.closeModal = function closeModal() {
  if (!overlayEl || !modalEl) return
  overlayEl.classList.remove('is-open')
  modalEl.classList.remove('is-open')
  document.body.classList.remove('no-scroll')
}

// Close on ESC and backdrop
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })
overlayEl?.addEventListener('click', closeModal)
modalEl?.addEventListener('click', (e) => {
  if (e.target.closest('.modal__close')) closeModal()
})

// how to use in page.js:
//openModal({ title: 'Add Note', html: '<form>...</form>' })

// Sticky header elevation
let navEl = document.querySelector('nav')
function toggleNavShadow() {
  if (!navEl) return
  let y = window.scrollY || window.pageYOffset
  navEl.classList.toggle('scrolled', y > 4)
}
toggleNavShadow()
document.addEventListener('scroll', toggleNavShadow, { passive: true })
