function initNavbar() {
  let navbar = document.querySelector('nav')
  if (!navbar) return false // nav not yet injected

  let toggle = document.getElementById('hamburger')
  let links = document.querySelector('.nav-links')

  let onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
  }

  onScroll()
  window.addEventListener('scroll', onScroll)

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      let open = links.classList.toggle('show')
      toggle.setAttribute('aria-expanded', String(open))
    })
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      let id = a.getAttribute('href')
      let el = id && document.querySelector(id)
      if (!el) return

      e.preventDefault()
      let top =
        el.getBoundingClientRect().top +
        window.scrollY -
        (navbar.offsetHeight || 0)

      window.scrollTo({ top, behavior: 'smooth' })

      if (links && toggle) {
        links.classList.remove('show')
        toggle.setAttribute('aria-expanded', 'false')
      }
    })
  })

  return true
}

document.addEventListener('DOMContentLoaded', () => {
  // try d8re, in case nav was already injected
  if (initNavbar()) return

  // simple retry loop in case nav is injected a bit later
  let tries = 0
  let maxTries = 40 // ~2 seconds if interval is 50ms

  let timer = setInterval(() => {
    if (initNavbar() || ++tries >= maxTries) {
      clearInterval(timer)
    }
  }, 50)
})

let reveals = document.querySelectorAll('.reveal, .text-reveal')

let observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active')
    } else {
      entry.target.classList.remove('active')
    }
  })
}, { threshold: 0.3 })

reveals.forEach(r => observer.observe(r))