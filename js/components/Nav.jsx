import React, { useEffect, useState } from 'react';

export const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = sessionStorage.getItem('userId');
    setUserId(id);

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const navInner = document.querySelector('.nav-inner');
    const breakpoint = 992;

    const toggleMenu = () => {
      if (!isOpen) {
        navLinks.appendChild(navActions);
        navLinks.classList.add('open');
        document.body.classList.add('no-scroll');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.classList.add('open-anim');
        setTimeout(() => hamburger.classList.remove('open-anim'), 380);
        setIsOpen(true);
      } else {
        closeMenu();
      }
    };

    const closeMenu = ({ instant = false } = {}) => {
      if (!navLinks.classList.contains('open')) return;
      if (instant || window.innerWidth > breakpoint) {
        navLinks.classList.remove('closing');
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');
        hamburger.setAttribute('aria-expanded', 'false');
        if (navActions.parentNode !== navInner) navInner.appendChild(navActions);
        setIsOpen(false);
        return;
      }
      navLinks.classList.add('closing');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.addEventListener('animationend', function handler() {
        navLinks.removeEventListener('animationend', handler);
        navLinks.classList.remove('closing');
        navLinks.classList.remove('open');
        document.body.classList.remove('no-scroll');
        if (navActions.parentNode !== navInner) navInner.appendChild(navActions);
        setIsOpen(false);
      });
    };

    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    window.addEventListener('resize', () => {
      if (window.innerWidth > breakpoint) closeMenu({ instant: true });
    });

    // Mark active links
    document.querySelectorAll('nav a[href]').forEach((a) => {
      try {
        const aPath = new URL(a.getAttribute('href'), window.location.href)
          .pathname
          .replace(/\/index\.html$/, '/');
        const cPath = window.location.pathname.replace(/\/index\.html$/, '/');
        if (aPath === cPath) a.setAttribute('aria-current', 'page');
      } catch {}
    });
  }, [isOpen]);

  useEffect(() => {
    const authBtn = document.querySelector('.nav-actions a');
    if (!authBtn) return;

    if (userId) {
      authBtn.textContent = 'Logout';
      authBtn.classList.add('logout-btn');
      authBtn.href = './../html/auth.html';
      authBtn.onclick = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('userId');
        setUserId(null);
        location.reload();
      };
    } else {
      authBtn.textContent = 'Login';
      authBtn.classList.remove('logout-btn');
      authBtn.href = './../html/auth.html';
      authBtn.onclick = null;
    }
  }, [userId]);

  return (
    <nav aria-label="Main">
      <div className="nav-row" id="nav-desc">
        <div className="nav-inner">
          <a className="nav-logo" href="../html/home.html" aria-label="DailyBites home">
            <img src="../assets/logo.png" alt="DailyBites Logo" />
          </a>
          <ul className="nav-links" id="primary-nav" role="navigation" aria-label="Primary">
            <li><a href="../html/home.html">Home</a></li>
            <li><a href="../html/recipe.html">All Recipes</a></li>
            <li><a href="../html/mealPlanner.html">Meal Planner</a></li>
            <li><a href="../html/customer.html">My Recipes</a></li>
            <li><a href="../html/about.html">About Us</a></li>
          </ul>
          <div className="nav-actions" id="nav-actions">
            <a className="btn light auth-btn" href="../../html/auth.html">Login</a>
          </div>
        </div>
      </div>
      <button className="hamburger" id="hamburger" aria-label="Menu" aria-controls="primary-nav" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
};
