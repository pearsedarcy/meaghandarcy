// Mobile menu functionality
function initMobileMenu() {
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    function toggleMenu() {
        const isOpen = !menu.classList.contains('hidden');
        
        // First handle the icons
        menuIcon.classList.toggle('opacity-0', !isOpen);
        closeIcon.classList.toggle('opacity-0', isOpen);
        
        // Then toggle the menu visibility
        menu.classList.toggle('hidden');
    }

    menuButton.addEventListener('click', toggleMenu);
}

// Timeline animation
function initTimelineAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

// Add scroll-based animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                if (entry.target.dataset.delay) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay}ms`;
                }
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

// Add navbar scroll functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    const scrollThreshold = 100; // Minimum scroll before hiding

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for styling
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Handle navbar visibility
        if (currentScroll <= 0) {
            navbar.classList.remove('hidden');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            // Scrolling down & past threshold - hide navbar
            navbar.classList.add('hidden');
        } else if (currentScroll < lastScroll) {
            // Scrolling up - show navbar
            navbar.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// Loading animation
function initLoadingAnimation() {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    const logoPath = document.querySelector('#Selection');
    
    // Reset animation state
    if (logoPath) {
        logoPath.style.strokeDashoffset = '1000';
        logoPath.style.fill = 'transparent';
    }
    
    // Force browser to acknowledge the reset
    void loader.offsetWidth;
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            content.style.opacity = '1';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 50);
        }, 700); // Reduced from 2500 to 1000ms
    });
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Get the turnstile token
        const turnstileResponse = turnstile.getResponse();
        
        if (!turnstileResponse) {
            errorMessage.textContent = 'Please complete the security check';
            errorMessage.classList.remove('hidden');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';

        try {
            // Using emailjs.sendForm() with turnstile token
            await emailjs.sendForm('service_v3wnnwq', 'template_8szctwd', this, {
                'cf-turnstile-response': turnstileResponse
            });
            
            successMessage.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            contactForm.reset();
            
            // Reset turnstile after successful submission
            turnstile.reset();
            
        } catch (error) {
            errorMessage.classList.remove('hidden');
            successMessage.classList.add('hidden');
            console.error('Error:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Message';
        }
    });
}

// Turnstile callback
window.onTurnstileSuccess = function(token) {
    console.log("Turnstile callback success");
};

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        message: form.querySelector('#message').value
    };

    // Get turnstile token
    const token = turnstile.getResponse();
    
    if (!token) {
        errorMessage.textContent = 'Please complete the security check';
        errorMessage.classList.remove('hidden');
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending...';

    try {
        // First verify with Cloudflare Worker
        const verificationResponse = await fetch('https://ancient-band-3ba1.pearse-darcy.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        const verificationResult = await verificationResponse.json();

        if (!verificationResult.success) {
            throw new Error('Turnstile verification failed');
        }

        // If verification successful, proceed with EmailJS
        await emailjs.send(
            'service_v3wnnwq', 
            'template_8szctwd',
            {
                ...formData,
                'cf-turnstile-response': token
            }
        );

        successMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        form.reset();
        turnstile.reset();

    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = error.message || 'Failed to send message. Please try again.';
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Message';
    }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    initLoadingAnimation();
    initMobileMenu();
    initTimelineAnimation();
    initScrollAnimations();
    initNavbar();
    initSmoothScrolling();
    // Remove the old form initialization if it exists
    // The form is now handled by handleFormSubmit
});

// Add reload handling
window.addEventListener('beforeunload', () => {
    localStorage.setItem('shouldAnimate', 'true');
});


async function handleSubmit() {
    const token = document.querySelector('[name="cf-turnstile-response"]').value;
  
    const response = await fetch("https://ancient-band-3ba1.pearse-darcy.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });
  
    const result = await response.json();
  
    if (result.success) {
      alert("CAPTCHA verified successfully!");
      // Proceed with EmailJS or other actions
    } else {
      alert("CAPTCHA verification failed.");
    }
  }
