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

// Turnstile callback
window.onTurnstileSuccess = function(token) {
    console.log("Turnstile callback success");
};

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Get form data
        const formData = {
            from_name: this.querySelector('#name').value,
            reply_to: this.querySelector('#email').value,
            message: this.querySelector('#message').value
        };

        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';

        try {
            // Send directly with EmailJS first
            await emailjs.send(
                'service_v3wnnwq', 
                'template_8szctwd',
                formData,
                'dDlPRORlAbwCAwAnH' // Public key
            );

            // If email sent successfully, verify turnstile
            const token = turnstile.getResponse();
            if (token) {
                // Verify turnstile in background, don't wait for response
                fetch('https://ancient-band-3ba1.pearse-darcy.workers.dev/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                    mode: 'no-cors' // Add this to handle CORS
                }).catch(console.error); // Log any errors but don't affect user experience
            }

            successMessage.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            form.reset();
            turnstile.reset();

        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Failed to send message. Please try again.';
            errorMessage.classList.remove('hidden');
            successMessage.classList.add('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Message';
        }
    });
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    initLoadingAnimation();
    initMobileMenu();
    initTimelineAnimation();
    initScrollAnimations();
    initNavbar();
    initSmoothScrolling();
    initContactForm();
});

// Add reload handling
window.addEventListener('beforeunload', () => {
    localStorage.setItem('shouldAnimate', 'true');
});
