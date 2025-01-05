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

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initTimelineAnimation();
});
