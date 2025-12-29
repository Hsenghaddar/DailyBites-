// Favicon
let head = document.querySelector("head")
let icon = document.createElement('link')
icon.rel = 'icon'
icon.type = 'image/png'
icon.href = '../assets/plate.png'
head.append(icon)

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
