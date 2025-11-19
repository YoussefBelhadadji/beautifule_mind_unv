// ========== Dark Mode & Loading Animations ==========
// يعمل على جميع الصفحات

(function() {
	'use strict';
	
	// ========== Dark Mode ==========
	const darkModeToggle = document.getElementById('darkModeToggle');
	const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
	const html = document.documentElement;
	
	// تحميل التفضيل من localStorage
	const currentTheme = localStorage.getItem('theme') || 'light';
	html.setAttribute('data-theme', currentTheme);
	
	// دالة تبديل الوضع
	function toggleDarkMode() {
		const currentTheme = html.getAttribute('data-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		
		html.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
		
		// إضافة animation
		document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
		
		console.log(`🌙 Dark Mode: ${newTheme === 'dark' ? 'ON' : 'OFF'}`);
	}
	
	// Desktop Toggle
	if (darkModeToggle) {
		darkModeToggle.addEventListener('click', toggleDarkMode);
	}
	
	// Mobile Toggle
	if (darkModeToggleMobile) {
		darkModeToggleMobile.addEventListener('click', toggleDarkMode);
	}
	
	// Keyboard shortcut: Ctrl/Cmd + Shift + D
	document.addEventListener('keydown', function(e) {
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
			e.preventDefault();
			toggleDarkMode();
		}
	});
	
	console.log('✅ Dark Mode initialized');
	
	// ========== Page Loading Progress Bar ==========
	const loadingBar = document.getElementById('pageLoadingBar');
	
	// بدء التحميل
	window.addEventListener('load', function() {
		if (loadingBar) {
			loadingBar.style.width = '100%';
			setTimeout(() => {
				loadingBar.style.opacity = '0';
				setTimeout(() => {
					loadingBar.style.display = 'none';
				}, 300);
			}, 200);
		}
	});
	
	// تحديث شريط التقدم أثناء التحميل
	let progress = 0;
	const progressInterval = setInterval(() => {
		if (progress < 90) {
			progress += Math.random() * 10;
			if (loadingBar) {
				loadingBar.style.width = progress + '%';
			}
		}
	}, 200);
	
	window.addEventListener('load', () => {
		clearInterval(progressInterval);
	});
	
	// ========== Lazy Loading للصور ==========
	const lazyImages = document.querySelectorAll('img[data-src]');
	
	const imageObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const img = entry.target;
				
				// إضافة blur effect
				img.classList.add('lazy-loading');
				
				// تحميل الصورة
				img.src = img.dataset.src;
				
				img.onload = () => {
					img.classList.remove('lazy-loading');
					img.classList.add('lazy-loaded', 'fade-in');
					img.removeAttribute('data-src');
				};
				
				observer.unobserve(img);
			}
		});
	}, {
		rootMargin: '50px'
	});
	
	lazyImages.forEach(img => {
		imageObserver.observe(img);
	});
	
	// ========== Fade In Animation للعناصر ==========
	const fadeElements = document.querySelectorAll('.course, .blog-post, .feature-box');
	
	const fadeObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('fade-in');
				fadeObserver.unobserve(entry.target);
			}
		});
	}, {
		threshold: 0.1
	});
	
	fadeElements.forEach(element => {
		fadeObserver.observe(element);
	});
	
	// ========== Smooth Scroll Performance ==========
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function(e) {
			const href = this.getAttribute('href');
			if (href !== '#' && href !== '#!') {
				e.preventDefault();
				const target = document.querySelector(href);
				if (target) {
					target.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}
			}
		});
	});
	
	console.log('✅ Loading Animations initialized');
	console.log(`Lazy images: ${lazyImages.length}, Fade elements: ${fadeElements.length}`);
})();

