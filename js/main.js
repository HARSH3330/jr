// ========================================
// PREMIUM B2B POLYMER MANUFACTURING WEBSITE
// JavaScript Interactivity & Animations
// ========================================

// ========================================
// STICKY NAVIGATION
// ========================================
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ========================================
// MOBILE MENU TOGGLE
// ========================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navbarNav = document.querySelector('.navbar-nav');

if (mobileMenuToggle) {
  // Toggle menu on button click with stopPropagation to prevent document listener
  mobileMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navbarNav.classList.toggle('active');
  });
}

// Close mobile menu when clicking outside navbar
document.addEventListener('click', (e) => {
  if (navbarNav && !navbar.contains(e.target)) {
    navbarNav.classList.remove('active');
  }
});

// ========================================
// SMOOTH SCROLL ANIMATIONS
// ========================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));
});

// ========================================
// TABS FUNCTIONALITY (for Products page)
// Uses event delegation for better scalability
// ========================================
const tabContainer = document.querySelector('.tabs');

if (tabContainer) {
  tabContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.tab-button');
    if (!button) return;

    const targetTab = button.dataset.tab;
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all buttons and contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to clicked button and corresponding content
    button.classList.add('active');
    const targetContent = document.getElementById(targetTab);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  });
}

// ========================================
// ACTIVE NAV LINK HIGHLIGHTING
// More robust detection that handles redirects and trailing slashes
// ========================================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  const currentPath = window.location.pathname;
  
  // Check if current page matches link href
  // Handles: /path/to/page.html, /page.html, /index.html, /
  const isCurrentPage = 
    currentPath.endsWith(href) || 
    (currentPath === '/' && href === 'index.html') ||
    (currentPath.endsWith('/') && href === 'index.html');
  
  if (isCurrentPage) {
    link.classList.add('active');
  }
});

// ========================================
