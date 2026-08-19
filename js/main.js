/**
 * ==========================================================================
 * PREMIUM LAW FIRM WEBSITE - MAIN JAVASCRIPT
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // 1. Sticky Navbar & Back-to-top Visibility
    const navbar = document.querySelector('.navbar-custom');
    const backToTopBtn = document.querySelector('.back-to-top');

    function checkScroll() {
        if (window.scrollY > 50) {
            if (navbar && !navbar.classList.contains('navbar-scrolled')) {
                navbar.classList.add('navbar-scrolled');
            }
            if (backToTopBtn) {
                backToTopBtn.classList.add('show');
            }
        } else {
            if (navbar && navbar.classList.contains('navbar-scrolled')) {
                navbar.classList.remove('navbar-scrolled');
            }
            if (backToTopBtn) {
                backToTopBtn.classList.remove('show');
            }
        }
    }

    // Run scroll check on load and scroll events
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    // 2. Smooth Scroll Back to Top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 3. Active Navigation State Based on Current URL
    const navItems = document.querySelectorAll('.navbar-custom .nav-item');
    const currentPath = window.location.pathname.toLowerCase();

    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link) {
            let href = link.getAttribute('href');
            if (href) {
                // Normalize href by removing relative back-steps
                const cleanHref = href.replace('../', '').toLowerCase();
                let isActive = false;

                if (cleanHref === 'index.html' || cleanHref === '') {
                    isActive = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
                } else {
                    const pageName = cleanHref.split('.html')[0];
                    isActive = currentPath.includes(cleanHref) || currentPath.includes('/' + pageName + '/');
                }

                if (isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        }
    });

    // 4. Animated Statistics Counters
    const counters = document.querySelectorAll('.stat-number');
    const counterDuration = 2000; // 2 seconds

    function runCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            if (isNaN(target)) return;

            let start = 0;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / counterDuration, 1);

                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(easeProgress * target);

                // Check if it should keep the "+" sign if it was in the original text
                const plusSign = counter.textContent.includes('+') ? '+' : '';
                counter.textContent = currentValue + plusSign;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + plusSign;
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // Intersection Observer to start counters when they come into view
    const statsSection = document.querySelector('.trust-strip');
    if (statsSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounters();
                    observer.unobserve(entry.target); // Run only once
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // 5. Legal Disclaimer Backdrop & Modal Popup (localStorage BCI Rules)
    const disclaimerBackdrop = document.getElementById('disclaimer-backdrop');
    const cookieNotice = document.getElementById('cookie-notice');
    const acceptBtn = document.getElementById('accept-disclaimer');

    if (cookieNotice) {
        // Remove close/cancel button from disclaimer modal
        const declineBtn = cookieNotice.querySelector('#decline-disclaimer') || cookieNotice.querySelector('.disclaimer-close-btn');
        if (declineBtn) declineBtn.remove();

        // Fix disclaimer logo image path if pointing to missing file
        const disclaimerLogoImg = cookieNotice.querySelector('.disclaimer-logo');
        if (disclaimerLogoImg) {
            disclaimerLogoImg.onerror = function () {
                const isSubfolder = window.location.pathname.includes('/services/') || window.location.pathname.includes('/team/') || window.location.pathname.includes('/blog/') || window.location.pathname.includes('/news/');
                this.src = isSubfolder ? '../images/Logo/croped logo.jpeg' : 'images/Logo/croped logo.jpeg';
            };
            if (disclaimerLogoImg.src.includes('logo.jpeg') && !disclaimerLogoImg.src.includes('croped logo.jpeg')) {
                const isSubfolder = window.location.pathname.includes('/services/') || window.location.pathname.includes('/team/') || window.location.pathname.includes('/blog/') || window.location.pathname.includes('/news/');
                disclaimerLogoImg.src = isSubfolder ? '../images/Logo/croped logo.jpeg' : 'images/Logo/croped logo.jpeg';
            }
        }

        // Automatically wrap text paragraphs in a scrollable div so header and "I AGREE" button stay fixed
        const descParas = cookieNotice.querySelectorAll('.cookie-notice-desc');
        if (descParas.length > 0 && !cookieNotice.querySelector('.disclaimer-scroll-content')) {
            const scrollDiv = document.createElement('div');
            scrollDiv.className = 'disclaimer-scroll-content';
            descParas[0].parentNode.insertBefore(scrollDiv, descParas[0]);
            descParas.forEach(p => scrollDiv.appendChild(p));
        }
    }

    if (disclaimerBackdrop && cookieNotice && acceptBtn) {
        const isAccepted = localStorage.getItem('legalDisclaimerAccepted');

        if (isAccepted !== 'true') {
            document.body.classList.add('disclaimer-active');
            disclaimerBackdrop.style.display = 'flex';
        }

        acceptBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.setItem('legalDisclaimerAccepted', 'true');

            // Set inline display to preserve visibility during fade out
            disclaimerBackdrop.style.display = 'flex';
            document.documentElement.classList.remove('disclaimer-pending');

            // Fade out backdrop overlay
            disclaimerBackdrop.style.opacity = '1';
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                if (opacity > 0) {
                    opacity -= 0.1;
                    disclaimerBackdrop.style.opacity = opacity;
                } else {
                    clearInterval(fadeInterval);
                    disclaimerBackdrop.style.display = 'none';
                    document.body.classList.remove('disclaimer-active');
                }
            }, 30);
        });
    }

    // 6. Reading Progress Bar (Articles)
    const progressIndicator = document.getElementById('reading-progress');
    const articleContainer = document.querySelector('.article-content');

    if (progressIndicator && articleContainer) {
        window.addEventListener('scroll', function () {
            const articleRect = articleContainer.getBoundingClientRect();
            const articleHeight = articleContainer.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Calculate progress based on scroll position relative to article element
            let progress = 0;
            const scrollFromTop = -articleRect.top;
            const maxScroll = articleHeight - viewportHeight;

            if (scrollFromTop > 0 && maxScroll > 0) {
                progress = (scrollFromTop / maxScroll) * 100;
                if (progress > 100) progress = 100;
            } else if (scrollFromTop >= articleHeight) {
                progress = 100;
            }

            progressIndicator.style.width = progress + '%';
        });
    }

    // 7. Blog / News Search and Category Filtering
    const searchInput = document.getElementById('blog-search');
    const categoryLinks = document.querySelectorAll('.category-filter-list a');
    const blogCards = document.querySelectorAll('.blog-card-col');

    function filterBlog() {
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let activeCategory = 'all';

        const activeLink = document.querySelector('.category-filter-list a.active');
        if (activeLink) {
            activeCategory = activeLink.getAttribute('data-category').toLowerCase();
        }

        blogCards.forEach(col => {
            const card = col.querySelector('.blog-card');
            const title = card.querySelector('.blog-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-card-excerpt').textContent.toLowerCase();
            const category = card.getAttribute('data-category').toLowerCase();

            const matchesSearch = title.includes(searchQuery) || excerpt.includes(searchQuery);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                col.style.display = 'block';
            } else {
                col.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterBlog);
    }

    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                filterBlog();
            });
        });
    }

    // 8. Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const subject = document.getElementById('contact-subject').value.trim();
            const disclaimerCheck = document.getElementById('contact-disclaimer');

            let isValid = true;

            // Simple validation feedback logic
            if (name === '') {
                showInputError('contact-name', 'Please enter your full name');
                isValid = false;
            } else {
                clearInputError('contact-name');
            }

            if (email === '' || !validateEmail(email)) {
                showInputError('contact-email', 'Please enter a valid email address');
                isValid = false;
            } else {
                clearInputError('contact-email');
            }

            if (phone === '' || !validatePhone(phone)) {
                showInputError('contact-phone', 'Please enter a valid 10-digit phone number');
                isValid = false;
            } else {
                clearInputError('contact-phone');
            }

            if (subject === '') {
                showInputError('contact-subject', 'Please enter a subject');
                isValid = false;
            } else {
                clearInputError('contact-subject');
            }

            if (disclaimerCheck && !disclaimerCheck.checked) {
                showInputError('contact-disclaimer', 'You must acknowledge the legal disclaimer before submitting');
                isValid = false;
            } else if (disclaimerCheck) {
                clearInputError('contact-disclaimer');
            }

            if (isValid) {
                showFormAlert(contactForm, 'success', '<strong>Success!</strong> Redirecting you to WhatsApp to complete your submission...');

                const practice = document.getElementById('contact-practice') ? document.getElementById('contact-practice').value : '';
                const subject = document.getElementById('contact-subject').value.trim();
                const messageVal = document.getElementById('contact-message') ? document.getElementById('contact-message').value.trim() : '';
                const methodPhone = document.getElementById('methodPhone');
                const preferredMethod = (methodPhone && methodPhone.checked) ? 'Phone Call' : 'Email';

                let msg = `*New Contact & Inquiry Form Submission*\n\n`;
                msg += `*Name:* ${name}\n`;
                msg += `*Phone:* ${phone}\n`;
                msg += `*Email:* ${email}\n`;
                if (practice) msg += `*Practice Area:* ${practice.toUpperCase()}\n`;
                msg += `*Subject:* ${subject}\n`;
                if (messageVal) msg += `*Message:* ${messageVal}\n`;
                msg += `*Preferred Contact:* ${preferredMethod}\n`;

                const whatsappUrl = `https://wa.me/917378858895?text=${encodeURIComponent(msg)}`;

                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                    contactForm.reset();
                    const alertPlaceholder = contactForm.querySelector('.alert-placeholder');
                    if (alertPlaceholder) alertPlaceholder.innerHTML = '';

                    // Clear green borders
                    const inputs = contactForm.querySelectorAll('.form-control, .form-select, .form-check-input');
                    inputs.forEach(input => input.classList.remove('is-valid'));
                }, 1000);
            }
        });
    }

    // 9. Careers Form Validation
    const careersForm = document.getElementById('careers-form');
    if (careersForm) {
        careersForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('career-name').value.trim();
            const email = document.getElementById('career-email').value.trim();
            const phone = document.getElementById('career-phone').value.trim();
            const resume = document.getElementById('career-resume');

            let isValid = true;

            if (name === '') {
                showInputError('career-name', 'Please enter your full name');
                isValid = false;
            } else {
                clearInputError('career-name');
            }

            if (email === '' || !validateEmail(email)) {
                showInputError('career-email', 'Please enter a valid email address');
                isValid = false;
            } else {
                clearInputError('career-email');
            }

            if (phone === '' || !validatePhone(phone)) {
                showInputError('career-phone', 'Please enter a valid 10-digit phone number');
                isValid = false;
            } else {
                clearInputError('career-phone');
            }

            if (resume && resume.files.length === 0) {
                showInputError('career-resume', 'Please upload your CV/Resume (PDF or DOCX format)');
                isValid = false;
            } else if (resume) {
                const file = resume.files[0];
                const allowedExtensions = /(\.pdf|\.doc|\.docx)$/i;
                if (!allowedExtensions.exec(file.name)) {
                    showInputError('career-resume', 'Invalid file type. Please upload a PDF or Word document');
                    isValid = false;
                } else {
                    clearInputError('career-resume');
                }
            }

            if (isValid) {
                showFormAlert(careersForm, 'success', '<strong>Success!</strong> Redirecting you to WhatsApp to submit your application details...');

                const position = document.getElementById('career-position') ? document.getElementById('career-position').value : '';
                const exp = document.getElementById('career-exp') ? document.getElementById('career-exp').value.trim() : '';
                const cover = document.getElementById('career-cover') ? document.getElementById('career-cover').value.trim() : '';
                const resumeInput = document.getElementById('career-resume');
                const resumeFileName = (resumeInput && resumeInput.files.length > 0) ? resumeInput.files[0].name : 'No file uploaded';

                let msg = `*New Career Application*\n\n`;
                msg += `*Name:* ${name}\n`;
                msg += `*Phone:* ${phone}\n`;
                msg += `*Email:* ${email}\n`;
                if (position) msg += `*Desired Position:* ${position.toUpperCase()}\n`;
                if (exp) msg += `*Experience/Academic:* ${exp}\n`;
                if (cover) msg += `*Cover Letter Summary:* ${cover}\n`;
                msg += `*Resume File:* [Attached: ${resumeFileName}]\n`;

                const whatsappUrl = `https://wa.me/917378858895?text=${encodeURIComponent(msg)}`;

                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                    careersForm.reset();
                    const alertPlaceholder = careersForm.querySelector('.alert-placeholder');
                    if (alertPlaceholder) alertPlaceholder.innerHTML = '';

                    // Clear green borders
                    const inputs = careersForm.querySelectorAll('.form-control, .form-select, .form-check-input');
                    inputs.forEach(input => input.classList.remove('is-valid'));
                }, 1000);
            }
        });
    }

    // 10. Booking / Quick Consultation Modal Form Validation
    const consultForm = document.getElementById('consultation-form');
    if (consultForm) {
        consultForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('consult-name').value.trim();
            const email = document.getElementById('consult-email').value.trim();
            const phone = document.getElementById('consult-phone').value.trim();
            const disclaimerCheck = document.getElementById('consult-disclaimer');

            let isValid = true;

            if (name === '') {
                showInputError('consult-name', 'Please enter your name');
                isValid = false;
            } else {
                clearInputError('consult-name');
            }

            if (email === '' || !validateEmail(email)) {
                showInputError('consult-email', 'Please enter a valid email');
                isValid = false;
            } else {
                clearInputError('consult-email');
            }

            if (phone === '' || !validatePhone(phone)) {
                showInputError('consult-phone', 'Please enter a valid 10-digit phone number');
                isValid = false;
            } else {
                clearInputError('consult-phone');
            }

            if (disclaimerCheck && !disclaimerCheck.checked) {
                showInputError('consult-disclaimer', 'You must accept the disclaimer');
                isValid = false;
            } else if (disclaimerCheck) {
                clearInputError('consult-disclaimer');
            }

            if (isValid) {
                showFormAlert(consultForm, 'success', '<strong>Success!</strong> Redirecting you to WhatsApp to complete booking...');

                const city = document.getElementById('consult-city') ? document.getElementById('consult-city').value.trim() : '';
                const matter = document.getElementById('consult-matter') ? document.getElementById('consult-matter').value : '';
                const date = document.getElementById('consult-date') ? document.getElementById('consult-date').value : '';
                const method = document.getElementById('consult-method') ? document.getElementById('consult-method').value : '';
                const desc = document.getElementById('consult-desc') ? document.getElementById('consult-desc').value.trim() : '';

                let msg = `*New Booking/Consultation Request*\n\n`;
                msg += `*Name:* ${name}\n`;
                msg += `*Phone:* ${phone}\n`;
                msg += `*Email:* ${email}\n`;
                if (city) msg += `*City:* ${city}\n`;
                if (matter) msg += `*Legal Matter:* ${matter.toUpperCase()}\n`;
                if (date) msg += `*Preferred Date:* ${date}\n`;
                if (method) msg += `*Preferred Contact:* ${method.toUpperCase()}\n`;
                if (desc) msg += `*Description:* ${desc}\n`;

                const whatsappUrl = `https://wa.me/917378858895?text=${encodeURIComponent(msg)}`;

                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                    consultForm.reset();

                    // If it's in a modal, close it
                    const modalEl = document.getElementById('consultationModal');
                    if (modalEl) {
                        const bootstrapModal = bootstrap.Modal.getInstance(modalEl);
                        if (bootstrapModal) bootstrapModal.hide();

                        const alertDiv = consultForm.querySelector('.alert-placeholder');
                        if (alertDiv) alertDiv.innerHTML = '';
                    }

                    // Clear green borders
                    const inputs = consultForm.querySelectorAll('.form-control, .form-select, .form-check-input');
                    inputs.forEach(input => input.classList.remove('is-valid'));
                }, 1000);
            }
        });
    }

    // Validation Utility Functions
    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        // Strip dashes/spaces for checks
        const cleaned = phone.replace(/[\s-()]/g, '');
        // Basic check for 10 digits
        return /^\d{10}$/.test(cleaned);
    }

    function showInputError(id, message) {
        const inputEl = document.getElementById(id);
        if (!inputEl) return;

        inputEl.classList.add('is-invalid');

        // Find or create invalid-feedback element
        let feedbackEl = inputEl.parentElement.querySelector('.invalid-feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.className = 'invalid-feedback';
            inputEl.parentElement.appendChild(feedbackEl);
        }
        feedbackEl.textContent = message;
    }

    function clearInputError(id) {
        const inputEl = document.getElementById(id);
        if (!inputEl) return;

        inputEl.classList.remove('is-invalid');
        inputEl.classList.add('is-valid');
    }

    function showFormAlert(form, type, message) {
        let alertPlaceholder = form.querySelector('.alert-placeholder');
        if (!alertPlaceholder) {
            alertPlaceholder = document.createElement('div');
            alertPlaceholder.className = 'alert-placeholder my-3';
            form.insertBefore(alertPlaceholder, form.firstChild);
        }

        alertPlaceholder.innerHTML = `
            <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert" style="border-radius:2px; font-size: 0.9rem;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // 11. Print Page Button Utility
    const printBtn = document.getElementById('print-article');
    if (printBtn) {
        printBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.print();
        });
    }

    // 12. Share Article Utility (Clipboard fallbacks)
    const shareBtn = document.getElementById('share-link');
    if (shareBtn) {
        shareBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);

            // Visual prompt
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="bi bi-check2"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    }

    // 13. Preloader fade-out & scrolling unlock safety handler
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(function () {
                preloader.style.display = 'none';
            }, 500);
        }
        document.body.classList.remove('preloader-active');
    }

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
        setTimeout(hidePreloader, 800); // Safety fallback so scrolling is guaranteed
    }

    // 14. Timed Consultation Modal Auto-Popup on Mobile (2 Minutes = 120,000 ms)
    function initMobileTimedConsultationModal() {
        const isMobile = window.innerWidth <= 991 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            const modalAlreadyShown = sessionStorage.getItem('consultationModalAutoPopped');
            if (!modalAlreadyShown) {
                setTimeout(function () {
                    const consultationModalEl = document.getElementById('consultationModal');
                    if (consultationModalEl && typeof bootstrap !== 'undefined') {
                        // Check if legal disclaimer backdrop is currently visible
                        const disclaimerBackdrop = document.getElementById('disclaimer-backdrop');
                        if (disclaimerBackdrop && window.getComputedStyle(disclaimerBackdrop).display !== 'none') {
                            return; // Do not interrupt disclaimer acceptance
                        }

                        const modalInstance = bootstrap.Modal.getInstance(consultationModalEl) || new bootstrap.Modal(consultationModalEl);
                        modalInstance.show();
                        sessionStorage.setItem('consultationModalAutoPopped', 'true');
                    }
                }, 120000); // 2 Minutes = 120,000 milliseconds
            }
        }
    }

    initMobileTimedConsultationModal();
});
