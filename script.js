document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        // Get form data
        const formData = {
            name: this.name.value,
            email: this.email.value,
            message: this.message.value
        };
        
        // Send email using EmailJS
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
            .then(function() {
                // Show success message
                successMessage.classList.remove('hidden');
                errorMessage.classList.add('hidden');
                // Reset form
                document.getElementById('contact-form').reset();
            })
            .catch(function(error) {
                // Show error message
                errorMessage.classList.remove('hidden');
                successMessage.classList.add('hidden');
                console.error('Error:', error);
            })
            .finally(function() {
                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = 'Send Message';
            });
    });

    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animation is triggered
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the item is visible
    });

    timelineItems.forEach(item => {
        observer.observe(item);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    AOS.init();
});