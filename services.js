/* ============================================
   PARSING SERVICES PAGE INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for jump tabs
  const jumpTabs = document.querySelectorAll('.jump-tab');
  
  jumpTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Update active state
        jumpTabs.forEach(t => t.style.background = '');
        tab.style.background = 'rgba(240, 112, 128, 0.25)';
        
        setTimeout(() => {
          tab.style.background = '';
        }, 1000);
      }
    });
  });

  // Intersection Observer for reveal animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => observer.observe(el));

  // Stagger animation for grid items
  const gridCards = document.querySelectorAll('.svc-card, .pricing-card');
  gridCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });

  // Active section highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    jumpTabs.forEach(tab => {
      const href = tab.getAttribute('href');
      if (href === `#${current}`) {
        tab.style.background = 'rgba(240, 112, 128, 0.25)';
        tab.style.borderColor = 'rgba(240, 112, 128, 0.6)';
      } else {
        tab.style.background = '';
        tab.style.borderColor = '';
      }
    });
  });

  // Pricing card hover effects enhancement
  const pricingCards = document.querySelectorAll('.pricing-card');
  
  pricingCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = this.classList.contains('featured') 
        ? 'scale(1.05) translateY(-10px)' 
        : 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = this.classList.contains('featured') 
        ? 'scale(1.05)' 
        : 'translateY(0)';
    });
  });

  // Add subtle parallax to hero section
  const heroSection = document.querySelector('.services-hero');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (heroSection && scrolled < window.innerHeight) {
      const parallax = scrolled * 0.5;
      heroSection.style.transform = `translateY(${parallax}px)`;
    }
  });

  // Counter animation for prices
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = 'R' + value.toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Trigger price animations when cards come into view
  const priceElements = document.querySelectorAll('.svc-price, .pricing-price');
  
  const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        const text = entry.target.textContent;
        const match = text.match(/R([\d\s,]+)/);
        
        if (match) {
          const numericValue = parseInt(match[1].replace(/[\s,]/g, ''));
          animateValue(entry.target, 0, numericValue, 1500);
        }
      }
    });
  }, { threshold: 0.5 });

  priceElements.forEach(el => priceObserver.observe(el));

  // Add magnetic effect to CTA button
  const ctaButton = document.querySelector('.btn-large');
  
  if (ctaButton) {
    ctaButton.addEventListener('mousemove', (e) => {
      const rect = ctaButton.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.2;
      const moveY = y * 0.2;
      
      ctaButton.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    ctaButton.addEventListener('mouseleave', () => {
      ctaButton.style.transform = 'translate(0, 0)';
    });
  }

  // Service card tilt effect
  const serviceCards = document.querySelectorAll('.svc-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  console.log('Services page initialized successfully');
});
