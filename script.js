// ============================================
// PARTICLE BACKGROUND SYSTEM
// ============================================
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0, radius: 150 };
    this.colors = ['#F07080', '#F05090', '#F4A0B8', '#F8C8D4'];
    this.connectionDistance = 150;
    
    this.init();
    this.bindEvents();
    this.animate();
  }
  
  init() {
    this.resize();
    const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 20000));
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this));
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw gradient background
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.3)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.95)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(p => {
      p.update(this);
      p.draw(this.ctx);
    });
    
    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          const opacity = (1 - distance / this.connectionDistance) * 0.15;
          this.ctx.strokeStyle = `rgba(240, 112, 128, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

class Particle {
  constructor(system) {
    this.system = system;
    this.x = Math.random() * system.canvas.width;
    this.y = Math.random() * system.canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = system.colors[Math.floor(Math.random() * system.colors.length)];
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  
  update(system) {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Mouse interaction
    const dx = system.mouse.x - this.x;
    const dy = system.mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < system.mouse.radius) {
      const force = (system.mouse.radius - distance) / system.mouse.radius;
      const angle = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * force * 2;
      this.y -= Math.sin(angle) * force * 2;
    }
    
    // Wrap around edges
    if (this.x < 0) this.x = system.canvas.width;
    if (this.x > system.canvas.width) this.x = 0;
    if (this.y < 0) this.y = system.canvas.height;
    if (this.y > system.canvas.height) this.y = 0;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================
// DESKTOP NAVIGATION CURSOR
// ============================================
class NavCursor {
  constructor() {
    this.tabs = document.querySelectorAll('.nav-tab');
    this.cursor = document.getElementById('navCursor');
    this.navTabs = document.getElementById('navTabs');
    
    if (!this.cursor || this.tabs.length === 0) return;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('mouseenter', () => this.moveCursor(tab));
      tab.addEventListener('click', () => this.navigateTo(tab));
    });
    
    this.navTabs.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
    });
  }
  
  moveCursor(tab) {
    const rect = tab.getBoundingClientRect();
    const parentRect = this.navTabs.getBoundingClientRect();
    
    this.cursor.style.width = `${rect.width}px`;
    this.cursor.style.left = `${rect.left - parentRect.left}px`;
    this.cursor.style.opacity = '1';
  }
  
  navigateTo(tab) {
    const href = tab.dataset.href;
    if (href) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// ============================================
// MOBILE MENU
// ============================================
class MobileMenu {
  constructor() {
    this.hamburger = document.getElementById('hamburger');
    this.menu = document.getElementById('mobileMenu');
    this.links = document.querySelectorAll('.mobile-link');
    this.isOpen = false;
    
    if (!this.hamburger || !this.menu) return;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.hamburger.addEventListener('click', () => this.toggle());
    
    this.links.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActive(index);
        const href = link.getAttribute('href');
        this.close();
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.hamburger.classList.toggle('active', this.isOpen);
    this.menu.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
  
  close() {
    this.isOpen = false;
    this.hamburger.classList.remove('active');
    this.menu.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  setActive(index) {
    this.links.forEach(link => link.classList.remove('active'));
    this.links[index]?.classList.add('active');
  }
}

// ============================================
// SCROLL EFFECTS
// ============================================
class ScrollEffects {
  constructor() {
    this.desktopNav = document.getElementById('desktopNav');
    this.revealElements = document.querySelectorAll('.reveal');
    
    this.bindEvents();
    this.checkReveal();
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      this.handleScroll();
      this.checkReveal();
    });
  }
  
  handleScroll() {
    if (window.scrollY > 50) {
      this.desktopNav?.classList.add('scrolled');
    } else {
      this.desktopNav?.classList.remove('scrolled');
    }
  }
  
  checkReveal() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    
    this.revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - revealPoint) {
        el.classList.add('visible');
      }
    });
  }
}

// ============================================
// VERTICAL IMAGE STACK
// ============================================
class ImageStack {
  constructor() {
    this.cards = document.querySelectorAll('.stack-card');
    this.dots = document.querySelectorAll('.stack-dot');
    this.currentIndexEl = document.getElementById('currentIndex');
    this.currentIndex = 0;
    this.total = this.cards.length;
    this.lastNavigationTime = 0;
    this.cooldown = 400;
    this.isDragging = false;
    this.startY = 0;
    
    if (this.cards.length === 0) return;
    
    this.bindEvents();
    this.updateStack();
  }
  
  bindEvents() {
    // Wheel navigation
    window.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > 30) {
        this.navigate(e.deltaY > 0 ? 1 : -1);
      }
    }, { passive: true });
    
    // Dot navigation
    this.dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index);
        if (index !== this.currentIndex) {
          this.currentIndex = index;
          this.updateStack();
        }
      });
    });
    
    // Drag navigation
    const stack = document.getElementById('imageStack');
    if (stack) {
      stack.addEventListener('mousedown', (e) => this.startDrag(e));
      stack.addEventListener('touchstart', (e) => this.startDrag(e));
      window.addEventListener('mousemove', (e) => this.onDrag(e));
      window.addEventListener('touchmove', (e) => this.onDrag(e));
      window.addEventListener('mouseup', (e) => this.endDrag(e));
      window.addEventListener('touchend', (e) => this.endDrag(e));
    }
  }
  
  startDrag(e) {
    this.isDragging = true;
    this.startY = e.touches ? e.touches[0].clientY : e.clientY;
  }
  
  onDrag(e) {
    if (!this.isDragging) return;
  }
  
  endDrag(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const diff = this.startY - endY;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      this.navigate(diff > 0 ? 1 : -1);
    }
  }
  
  navigate(direction) {
    const now = Date.now();
    if (now - this.lastNavigationTime < this.cooldown) return;
    this.lastNavigationTime = now;
    
    if (direction > 0) {
      this.currentIndex = this.currentIndex === this.total - 1 ? 0 : this.currentIndex + 1;
    } else {
      this.currentIndex = this.currentIndex === 0 ? this.total - 1 : this.currentIndex - 1;
    }
    
    this.updateStack();
  }
  
  updateStack() {
    this.cards.forEach((card, index) => {
      let diff = index - this.currentIndex;
      if (diff > this.total / 2) diff -= this.total;
      if (diff < -this.total / 2) diff += this.total;
      
      let transform = '';
      let zIndex = 0;
      let opacity = 0;
      let scale = 0.6;
      
      if (diff === 0) {
        transform = 'translate(-50%, -50%) translateY(0) scale(1) rotateX(0deg)';
        zIndex = 5;
        opacity = 1;
        scale = 1;
        card.classList.add('active');
      } else if (diff === -1) {
        transform = 'translate(-50%, -50%) translateY(-160px) scale(0.82) rotateX(8deg)';
        zIndex = 4;
        opacity = 0.6;
        scale = 0.82;
        card.classList.remove('active');
      } else if (diff === -2) {
        transform = 'translate(-50%, -50%) translateY(-280px) scale(0.7) rotateX(15deg)';
        zIndex = 3;
        opacity = 0.3;
        scale = 0.7;
        card.classList.remove('active');
      } else if (diff === 1) {
        transform = 'translate(-50%, -50%) translateY(160px) scale(0.82) rotateX(-8deg)';
        zIndex = 4;
        opacity = 0.6;
        scale = 0.82;
        card.classList.remove('active');
      } else if (diff === 2) {
        transform = 'translate(-50%, -50%) translateY(280px) scale(0.7) rotateX(-15deg)';
        zIndex = 3;
        opacity = 0.3;
        scale = 0.7;
        card.classList.remove('active');
      } else {
        transform = `translate(-50%, -50%) translateY(${diff > 0 ? 400 : -400}px) scale(0.6) rotateX(${diff > 0 ? -20 : 20}deg)`;
        zIndex = 0;
        opacity = 0;
        card.classList.remove('active');
      }
      
      card.style.transform = transform;
      card.style.zIndex = zIndex;
      card.style.opacity = opacity;
    });
    
    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
    
    // Update counter
    if (this.currentIndexEl) {
      this.currentIndexEl.textContent = String(this.currentIndex + 1).padStart(2, '0');
    }
  }
}

// ============================================
// CONTACT FORM
// ============================================
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    if (!this.form) return;
    
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Simulate submission
    const button = this.form.querySelector('button[type="submit"]');
    const originalHTML = button.innerHTML;
    button.innerHTML = 'Sending...';
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = '✓ Message Sent!';
      button.style.background = 'linear-gradient(135deg, #10b981, #14b8a6)';
      
      setTimeout(() => {
        this.form.reset();
        button.innerHTML = originalHTML;
        button.disabled = false;
        button.style.background = '';
      }, 2500);
    }, 1500);
  }
}

// ============================================
// SMOOTH SCROLL FOR ALL ANCHORS
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
  new NavCursor();
  new MobileMenu();
  new ScrollEffects();
  new ImageStack();
  new ContactForm();
  initSmoothScroll();
});
