/*
Theme Name: My VS Code Project
Author: Vedant Trivedi
Version: 1.0
*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing scripts...');
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function () {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Contact Form Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Show success message
            alert(`Thank you, ${name}! Your message has been received.\n\nWe will get back to you soon at ${email}`);

            // Reset form
            contactForm.reset();
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const formTitle = document.getElementById('formTitle');
    const toggleFormText = document.getElementById('toggleFormText');
    const toggleLoginText = document.getElementById('toggleLoginText');

    const showAdminLogin = document.getElementById('showAdminLogin');
    const showStudentLogin = document.getElementById('showStudentLogin');
    const adminLoginLink = document.getElementById('adminLoginLink');
    const studentLoginLink = document.getElementById('studentLoginLink');
    const passwordField = document.getElementById('password');
    const passwordGroup = document.getElementById('passwordRow');
    let is_admin_login = false;

    if (showAdminLogin && showStudentLogin) {
        showAdminLogin.addEventListener('click', function (e) {
            e.preventDefault();
            is_admin_login = true;
            console.log('Switched to admin login mode');
            formTitle.textContent = 'Clerk/Admin Login';
            document.querySelector('label[for="rollNumber"]').textContent = 'Email Address';
            document.getElementById('rollNumber').placeholder = 'Enter your email';
            document.getElementById('rollNumber').type = 'email';
            adminLoginLink.style.display = 'none';
            studentLoginLink.style.display = 'block';
            toggleFormText.style.display = 'none';
            // Hide password field and make it optional for admin login
            if (passwordGroup) {
                passwordGroup.style.display = 'none';
            }
            if (passwordField) {
                passwordField.required = false;
                passwordField.value = '';
            }
        });

        showStudentLogin.addEventListener('click', function (e) {
            e.preventDefault();
            is_admin_login = false;
            console.log('Switched to student login mode');
            formTitle.textContent = 'Student Login';
            document.querySelector('label[for="rollNumber"]').textContent = 'Roll Number';
            document.getElementById('rollNumber').placeholder = 'Enter your roll number';
            document.getElementById('rollNumber').type = 'text';
            adminLoginLink.style.display = 'block';
            studentLoginLink.style.display = 'none';
            toggleFormText.style.display = 'block';
            // Show password field again for student login
            if (passwordGroup) {
                passwordGroup.style.display = '';
            }
            if (passwordField) {
                passwordField.required = true;
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const rollNumber = document.getElementById('rollNumber').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('loginMessage');
            const submitBtn = this.querySelector('button[type="submit"]');

            console.log('Login attempt:', {
                is_admin_login,
                rollNumber,
                password: password.substring(0, 3) + '***'
            });

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            messageDiv.innerHTML = '';

            try {
                const API_URL = 'http://127.0.0.1:5000/api';
                const endpoint = is_admin_login ? 'auth/admin/login' : 'auth/login';
                const body = is_admin_login
                    ? { email: rollNumber, password: password }
                    : { roll_number: rollNumber, password: password };

                console.log('Sending request to:', `${API_URL}/${endpoint}`);
                console.log('Request body:', body);

                const response = await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (data.success) {
                    // Save token to localStorage
                    localStorage.setItem('studentToken', data.token);
                    localStorage.setItem('studentData', JSON.stringify(data.student || data.admin));

                    messageDiv.innerHTML = `
                        <div style="background: #d1fae5; color: #065f46; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            ✓ Login successful! Welcome ${data.student ? data.student.name : data.admin.name}
                        </div>
                    `;

                    // Role-based redirection
                    setTimeout(() => {
                        const userRole = data.admin ? data.admin.role : 'student';
                        if (userRole === 'admin' || userRole === 'clerk' || userRole === 'super_admin') {
                            window.location.href = 'clerk-dashboard.html';
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1500);
                } else {
                    messageDiv.innerHTML = `
                        <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            ✗ ${data.message}
                        </div>
                    `;
                }
            } catch (error) {
                messageDiv.innerHTML = `
                    <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        ✗ Connection error: ${error.message}. <br>
                        <small>Check if server is running at http://127.0.0.1:5000</small>
                    </div>
                `;
                console.error('Full Login Error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // Registration Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const rollNumber = document.getElementById('regRollNumber').value;
            const enrollmentId = document.getElementById('regEnrollmentId').value;
            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            const submitBtn = this.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';
            messageDiv.innerHTML = '';

            try {
                const API_URL = 'http://127.0.0.1:5000/api';
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        roll_number: rollNumber,
                        enrollment_id: enrollmentId,
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        phone: phone,
                        password: password
                    })
                });
                const data = await response.json();
                if (data.success) {
                    messageDiv.innerHTML = `
                        <div style="background: #d1fae5; color: #065f46; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            ✓ Registration successful! You can now log in.
                        </div>
                    `;
                    // Switch to login form after short delay
                    setTimeout(() => {
                        if (showLogin) showLogin.click();
                    }, 1500);
                } else {
                    messageDiv.innerHTML = `
                        <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            ✗ ${data.message}
                        </div>
                    `;
                }
            } catch (error) {
                messageDiv.innerHTML = `
                    <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        ✗ Connection error: ${error.message}
                    </div>
                `;
                console.error('Registration error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }

    // Newsletter Form Handler
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing!\n\nA confirmation email will be sent to ${email}`);
            form.reset();
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add active class to current navigation item
    const currentLocation = location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentLocation === href.split('/').pop() ||
            (currentLocation === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and other elements
    document.querySelectorAll('.feature-card, .dept-card, .link-card, .facility-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Form validation for contact form
    const contactFormInputs = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');
    contactFormInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
    });

    function validateField(field) {
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value) && field.value !== '') {
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = '#e5e7eb';
            }
        } else if (field.type === 'tel') {
            const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
            if (!phoneRegex.test(field.value) && field.value !== '') {
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = '#e5e7eb';
            }
        }
    }

    // Scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑ Top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: none;
        z-index: 999;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(scrollButton);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    scrollButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollButton.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    });

    scrollButton.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    // Counter animation for stats section
    const stats = document.querySelectorAll('.stat h3');
    let hasAnimated = false;

    const statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateCounters() {
        stats.forEach(stat => {
            const text = stat.textContent;
            const number = parseInt(text.match(/\d+/)[0]);
            let current = 0;
            const increment = number / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    stat.textContent = text;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + text.substring(String(number).length);
                }
            }, 20);
        });
    }

    // Add loading animation to forms
    const forms = document.querySelectorAll('form[type = "submit"]');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Loading...';
                submitBtn.disabled = true;
            }
        });
    });

    // Prevent form double submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && submitBtn.dataset.submitted) {
                e.preventDefault();
            }
            if (submitBtn) {
                submitBtn.dataset.submitted = 'true';
                setTimeout(() => {
                    submitBtn.dataset.submitted = 'false';
                }, 1000);
            }
        });
    });

    // Add keyboard navigation for mobile menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            navMenu?.classList.remove('active');
            hamburger?.classList.remove('active');
        }
    });

    console.log('Website loaded successfully!');
});

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Function to fetch and display updates
async function loadUpdates() {
    const updatesContainer = document.getElementById('updatesContainer');

    if (!updatesContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/updates`);
        const data = await response.json();

        if (data.success && data.updates.length > 0) {
            const updatesHTML = data.updates.map(update => {
                const date = new Date(update.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const categoryIcon = {
                    'Academic': '📚',
                    'Events': '🏆',
                    'Placements': '💼',
                    'Facilities': '🔧',
                    'Announcements': '📢'
                };

                return `
                    <div class="update-card">
                        <div class="update-date">${date}</div>
                        <div class="update-category">${categoryIcon[update.category] || '📋'} ${update.category}</div>
                        <h3>${update.title}</h3>
                        <p>${update.content.substring(0, 200)}...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                `;
            }).join('');

            updatesContainer.innerHTML = updatesHTML;
        } else {
            updatesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f0f9ff; border-radius: 8px;">
                    <p style="color: #0f172a;">No updates available at the moment.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading updates:', error);
        updatesContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #fee2e2; border-radius: 8px;">
                <p style="color: #991b1b;">⚠️ Unable to load updates. Please try again later.</p>
            </div>
        `;
    }
}

// Load updates when on the updates page
if (window.location.pathname.includes('updates.html') || window.location.pathname.includes('updates')) {
    loadUpdates();
}

// Utility function for localStorage
const StorageManager = {
    set: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    get: function (key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    remove: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    clear: function () {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Export utilities
window.StorageManager = StorageManager;
