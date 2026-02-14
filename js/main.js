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
// FORM VALIDATION (Contact page)
// Inline feedback instead of alerts
// ========================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  // Create feedback container
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'form-feedback';
  feedbackDiv.style.display = 'none';
  contactForm.insertBefore(feedbackDiv, contactForm.firstChild);

  // Helper function to show feedback
  function showFeedback(message, type = 'error') {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `form-feedback form-feedback--${type}`;
    feedbackDiv.style.display = 'block';
    
    // Auto-hide success message after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        feedbackDiv.style.display = 'none';
      }, 3000);
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validate required fields
    if (!name || !email || !message) {
      showFeedback('Please fill in all required fields.', 'error');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }
    
    // Success message
    showFeedback('Thank you for your inquiry! We will get back to you soon.', 'success');
    contactForm.reset();
  });
}

// ========================================
// SCROLL TO TOP FUNCTIONALITY
// ========================================
const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 500 ? 'flex' : 'none';
  });
  
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========================================
// COUNTER ANIMATION FOR STATS
// Handles edge case for zero values
// ========================================
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };
  
  updateCounter();
}

const statsSection = document.querySelector('.stats-grid');

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      entry.target.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.dataset.target);
        if (!isNaN(target)) {
          animateCounter(counter, target);
        }
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  
  statsObserver.observe(statsSection);
}

// ========================================
// CARD HOVER EFFECTS ENHANCEMENT
// ========================================
document.querySelectorAll('.card, .industry-card').forEach(card => {
  card.style.transition = 'all 0.3s ease';
});

// ========================================
// NATIVE LAZY LOADING FOR IMAGES
// Modern browsers support native lazy loading
// ========================================
// No fallback needed - all target browsers support HTML loading="lazy" attribute
