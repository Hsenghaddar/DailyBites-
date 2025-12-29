(async function inject() {
  let slots = Array.from(document.querySelectorAll('[data-include]'))

  // getdirectory where this script lives
  let scriptUrl = document.currentScript
    ? document.currentScript.src
    : window.location.href

  // layout/html/ relative to inject.js
  let partialsBase = new URL('../html/', scriptUrl)
  // layout/js/main.js relative to inject.js
  let mainJsUrl = new URL('main.js', scriptUrl)

  let load = async (slot) => {
    let name = slot.getAttribute('data-include')

    try {
      let url = new URL(`${name}.html`, partialsBase)

      let res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) throw new Error(res.status)

      let html = await res.text()
      let wrapper = document.createElement('div')
      wrapper.innerHTML = html.trim()

      let frag = document.createDocumentFragment()
      while (wrapper.firstChild) frag.appendChild(wrapper.firstChild)
      slot.replaceWith(frag)
    } catch (err) {
      console.warn(`[inject] Failed to load ${name}:`, err)
    }
  }

  // inject requested partials
  await Promise.all(slots.map(load))

  // mark active link in the nav
  document.querySelectorAll('nav a[href]').forEach((a) => {
    try {
      // resolve hrefs relative to current page
      let aPath = new URL(a.getAttribute('href'), window.location.href)
        .pathname
        .replace(/\/index\.html$/, '/')

      let cPath = window.location.pathname.replace(/\/index\.html$/, '/')

      if (aPath === cPath) a.setAttribute('aria-current', 'page')
    } catch {}
  })

  // signal that layout is ready (for any late bindings)
  document.dispatchEvent(new CustomEvent('layout:ready'))

  // ensure shared behavior runs AFTER injection:
  if (!document.querySelector('script[data-main]')) {
    let s = document.createElement('script')
    s.src = mainJsUrl.href
    s.dataset.main = 'true'
    document.body.appendChild(s)
  }
})()
