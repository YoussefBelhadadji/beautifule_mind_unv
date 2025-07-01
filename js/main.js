	// Stats Counter Animation
	var statsSection = $('#stats');
	if (statsSection.length) {
		var a = 0;
		$(window).scroll(function() {
			var oTop = statsSection.offset().top - window.innerHeight;
			if (a == 0 && $(window).scrollTop() > oTop) {
				$('.stat-count').each(function() {
					var $this = $(this),
						countTo = $this.attr('data-target');
					$({
						countNum: $this.text()
					}).animate({
						countNum: countTo
					}, {
						duration: 2000,
						easing: 'swing',
						step: function() {
							$this.text(Math.floor(this.countNum));
						},
						complete: function() {
							// For numbers over 1000, add a comma, and for others, keep them as is.
							var finalNum = this.countNum >= 1000 ? parseInt(this.countNum).toLocaleString('ar-EG') : this.countNum;
							$this.text(finalNum);
						}
					});
				});
				a = 1; // This ensures the animation runs only once
			}
		});
	}


(function($) {
    "use strict";

    // ----------------------------------------------------
    // --- 1. Global Functions (Run on every page) ---
    // ----------------------------------------------------

    // Preloader
    $(window).on('load', function() {
        $("#preloader").delay(600).fadeOut();
    });

    // Mobile Navigation Toggle
    $('.navbar-toggle').on('click', function() {
        $('#header').toggleClass('nav-collapse');
    });


    // ----------------------------------------------------
    // --- 2. Page Specific Functions (Wrapped in a ready check) ---
    // ----------------------------------------------------
    $(document).ready(function() {

        // --- Homepage Specific ---

        // Stats Counter Animation
        if ($('#stats').length) {
            var statsAnimated = false;
            $(window).on('scroll', function() {
                var oTop = $('#stats').offset().top - window.innerHeight;
                if (!statsAnimated && $(window).scrollTop() > oTop) {
                    $('.stat-count').each(function() {
                        var $this = $(this);
                        var countTo = $this.attr('data-target');
                        $({ countNum: $this.text() }).animate({
                            countNum: countTo
                        }, {
                            duration: 2000,
                            easing: 'swing',
                            step: function() { $this.text(Math.floor(this.countNum)); },
                            complete: function() { $this.text(parseInt(this.countNum).toLocaleString('ar-EG')); }
                        });
                    });
                    statsAnimated = true;
                }
            });
        }

        // Modern Testimonials Slider
        if ($('#testimonials-slider-modern').length) {
            var owl = $('#testimonials-slider-modern');
            owl.owlCarousel({
                items: 1, loop: true, margin: 10, autoplay: true,
                autoplayTimeout: 6000, autoplayHoverPause: true,
                nav: false, dots: false, rtl: true
            });
            $('.testimonial-nav .custom-next').click(function() { owl.trigger('next.owl.carousel'); });
            $('.testimonial-nav .custom-prev').click(function() { owl.trigger('prev.owl.carousel'); });
        }

        // Review Form Submission Simulation
        $('#review-form').on('submit', function(e) {
            e.preventDefault();
            $(this).fadeOut(400, function() {
                $('#review-form-success').fadeIn(400);
            });
        });


        // --- Courses Page Specific ---

        // Isotope Filtering and Load More
        if ($('.courses-container').length) {
            var $grid = $('.courses-container').isotope({
                itemSelector: '.course-item',
                layoutMode: 'masonry',
                originLeft: false // Important for RTL
            });

            $('.course-filter').on('click', 'a', function(e) {
                e.preventDefault();
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({ filter: filterValue });
                $('.course-filter a').removeClass('active');
                $(this).addClass('active');
            });

            // Load More Functionality
            var initialItems = 6, loadMoreItems = 3;
            var $items = $('.course-item');
            $items.filter(':gt(' + (initialItems - 1) + ')').hide();
            if ($items.length <= initialItems) { $('#load-more-courses').hide(); }
            $('#load-more-courses').on('click', function(e) {
                e.preventDefault();
                $('.course-item:hidden').filter(':lt(' + loadMoreItems + ')').fadeIn();
                setTimeout(function() { $grid.isotope('layout'); }, 400);
                if ($('.course-item:hidden').length === 0) { $('#load-more-courses').fadeOut(); }
            });
        }


        // --- Registration Page Specific ---

        // Smart Registration Form UI Logic
        if ($('#user-type-selection').length) {
            $('.user-type-box').on('click', function() {
                var targetForm = $(this).data('target');
                $('#user-type-selection').fadeOut(400, function() {
                    $(targetForm).fadeIn(400);
                });
            });

            $('input[name="patient_type"]').on('change', function() {
                if ($(this).val() === 'child') {
                    $('.child-fields').slideDown();
                    $('#patient-info-title').text('معلومات الطفل');
                    $('.child-fields input').prop('required', true);
                } else {
                    $('.child-fields').slideUp();
                    $('#patient-info-title').text('معلومات المستفيد (البالغ)');
                    $('.child-fields input').prop('required', false);
                }
            });
        }
        
        // --- Firebase Logic (Must check for firebase existence) ---
        if (typeof firebase !== 'undefined') {
            const auth = firebase.auth();
            const db = firebase.firestore();

            // 1. Authentication State Management (Runs on all pages)
            auth.onAuthStateChanged(user => {
                if (user) {
                    db.collection("users").doc(user.uid).get().then(doc => {
                        if (doc.exists) {
                            $('#user-display-name').text(doc.data().fullName);
                        }
                    });
                    $('.user-profile-nav').show();
                    $('#login-register-nav').hide();
                } else {
                    $('.user-profile-nav').hide();
                    $('#login-register-nav').show();
                }
            });

            // 2. Logout functionality
            $('#logout-button').on('click', function(e) {
                e.preventDefault();
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch(error => console.error("Logout Error:", error));
            });
            
            // 3. Specialist Form Submission
            $('#specialist-form-wrapper form').on('submit', function(e) {
                e.preventDefault();
                const form = $(this);
                const email = form.find('input[type="email"]').val();
                const password = "some_secure_default_password_123";
                const fullName = form.find('input[placeholder="الاسم الكامل"]').val();
                //... get other fields
                
                form.find('button').prop('disabled', true).text('جارٍ الإرسال...');

                auth.createUserWithEmailAndPassword(email, password)
                    .then(cred => db.collection("users").doc(cred.user.uid).set({ /* ... user data ... */ }))
                    .then(() => { alert("تم استلام طلبك بنجاح!"); form.trigger("reset"); })
                    .catch(error => { console.error("Firebase Error:", error); alert("خطأ: " + error.message); })
                    .finally(() => form.find('button').prop('disabled', false).text('إرسال طلب الانضمام'));
            });

            // 4. Patient/Guardian Form Submission
            $('#patient-form-wrapper form').on('submit', function(e) {
                e.preventDefault();
                const form = $(this);
                const isChild = form.find('input[name="patient_type"]:checked').val() === 'child';
                
                const patientName = form.find('input[name="patient_name"]').val();
                //... get other patient fields

                form.find('button').prop('disabled', true).text('جارٍ فتح الملف...');

                if (isChild) {
                    const guardianEmail = form.find('input[name="guardian_email"]').val();
                    const guardianPassword = "default_guardian_password_123";
                    //... get other guardian fields

                    auth.createUserWithEmailAndPassword(guardianEmail, guardianPassword)
                        .then(guardianCred => {
                            // Now create child account and link them
                            // ... (full logic as before) ...
                             alert("تم فتح الملف بنجاح!");
                             form.trigger("reset");
                        })
                        .catch(error => { console.error("Firebase Error:", error); alert("خطأ: " + error.message); })
                        .finally(() => form.find('button').prop('disabled', false).text('تقديم الطلب وفتح الملف'));
                } else {
                    const adultEmail = `adult.${Date.now()}@beautifulmind.app`;
                    const adultPassword = "default_adult_password_123";
                    
                    auth.createUserWithEmailAndPassword(adultEmail, adultPassword)
                        .then(cred => {
                            // Save adult patient data
                            // ... (full logic as before) ...
                            alert("تم فتح ملفك بنجاح!");
                             form.trigger("reset");
                        })
                        .catch(error => { console.error("Firebase Error:", error); alert("خطأ: " + error.message); })
                        .finally(() => form.find('button').prop('disabled', false).text('تقديم الطلب وفتح الملف'));
                }
            });
        } // End of Firebase logic block
    }); // End of $(document).ready()
})(jQuery);
	// Testimonials Slider Initialization
	if ($('#testimonials-slider').length) {
		$('#testimonials-slider').owlCarousel({
			loop: true,
			margin: 20,
			nav: false, //  Hide navigation arrows
			dots: true, // Show dots
			autoplay: true,
			autoplayTimeout: 5000,
			autoplayHoverPause: true,
			rtl: true, // Important for Arabic
			responsive:{
				0:{
					items:1
				},
				768:{
					items:2
				},
				992:{
					items:2 // You can change to 3 if you have many testimonials
				}
			}
		});
	}
	
	// Modern Testimonials Slider
	if ($('#testimonials-slider-modern').length) {
		var owl = $('#testimonials-slider-modern');
		owl.owlCarousel({
			items: 1,
			loop: true,
			margin: 10,
			autoplay: true,
			autoplayTimeout: 6000,
			autoplayHoverPause: true,
			nav: false, // We use custom navigation
			dots: false,
			rtl: true // Important for Arabic
		});

		// Custom Navigation Events
		$('.testimonial-nav .custom-next').click(function() {
			owl.trigger('next.owl.carousel');
		});
		$('.testimonial-nav .custom-prev').click(function() {
			owl.trigger('prev.owl.carousel');
		});
	}
		// Review Form Submission (Front-end simulation)
	$('#review-form').on('submit', function(e) {
		e.preventDefault(); // منع الإرسال الفعلي للصفحة
		
		var form = $(this);

		// يمكنك هنا إضافة تحقق من صحة الحقول إذا أردت

		// إخفاء النموذج وإظهار رسالة الشكر بسلاسة
		form.fadeOut(400, function() {
			$('#review-form-success').fadeIn(400);
		});
	});
		// Smart Registration Form Logic
	$(document).ready(function() {
		// 1. Show form based on user type selection
		$('.user-type-box').on('click', function() {
			var targetForm = $(this).data('target');

			$('#user-type-selection').fadeOut(400, function() {
				$(targetForm).fadeIn(400);
			});
		});

		// 2. Logic for patient form (Adult vs Child)
		$('input[name="patient_type"]').on('change', function() {
			if ($(this).val() === 'child') {
				$('.child-fields').slideDown();
				$('#patient-info-title').text('معلومات الطفل');
                // Make guardian fields required when child is selected
                $('.child-fields input').prop('required', true);
			} else {
				$('.child-fields').slideUp();
				$('#patient-info-title').text('معلومات المستفيد (البالغ)');
                // Make guardian fields not required when adult is selected
                $('.child-fields input').prop('required', false);
			}
		});
	});
	// Dynamic Course Details Page Logic
$(document).ready(function() {
    if ($('#course-details-page').length) {
        
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        const course = courseDatabase[courseId];

        if (course) {
            // --- Populate All Page Elements ---

            // Hero Area
            document.title = course.title + " | العقل الجميل";
            $('#hero-title').text(course.title);
            $('#hero-category').text(course.category);
            $('#hero-bg').css('background-image', 'url(' + course.image + ')');

            // What you'll learn
            let learningHTML = '';
            if(course.learn) {
                course.learn.forEach(item => {
                    learningHTML += '<div class="col-md-6"><div class="learning-box"><i class="fa fa-check"></i> <span>'+ item +'</span></div></div>';
                });
            }
            $('#learning-outcomes').html(learningHTML);

            // Description
            $('#course-description').text(course.description);

            // Instructor
            if(course.instructor) {
                $('#instructor-name').text(course.instructor.name);
                $('#instructor-image').attr('src', course.instructor.image).attr('alt', course.instructor.name);
            }

            // Sidebar
            $('#sidebar-image').attr('src', course.image).attr('alt', course.title);
            //  (You can add price logic to your database later)
            $('#sidebar-price').html('مدفوعة<del class="old-price"></del>'); 

            // Course Features (You can add this to your course-data.js)
            const features = [
                '8 ساعات فيديو عند الطلب',
                '15 مصدر قابل للتنزيل',
                'وصول كامل مدى الحياة',
                'شهادة إتمام معتمدة'
            ];
            let featuresHTML = '';
            features.forEach(feature => {
                featuresHTML += '<li><i class="fa fa-check-circle"></i> '+ feature +'</li>';
            });
            $('.course-features').html(featuresHTML);


            // --- Activate All Interactive Elements ---

            // Star Rating Generator
            function generateStars(element) {
                var rating = $(element).data('rating');
                if (!rating) return;
                var full = Math.floor(rating), half = (rating % 1 !== 0), empty = 5 - full - (half ? 1 : 0);
                var stars = ''.padStart(full, '<i class="fa fa-star filled"></i>') + (half ? '<i class="fa fa-star-half-o filled"></i>' : '') + ''.padStart(empty, '<i class="fa fa-star"></i>');
                $(element).html(stars);
            }
            $('.star-rating').each(function() { generateStars(this); });

            // Rating Breakdown Bars (sample data)
            var ratingData = [2, 10, 25, 150, 800], totalRatings = ratingData.reduce((a, b) => a + b, 0), breakdownHTML = '';
            for (var i = 4; i >= 0; i--) {
                var percentage = totalRatings > 0 ? (ratingData[i] / totalRatings) * 100 : 0;
                breakdownHTML += '<div class="rating-bar"><div class="bar-label">'+(i+1)+' نجوم</div><div class="bar-container"><div class="bar-fill" style="width: '+percentage+'%;"></div></div></div>';
            }
            $('.rating-breakdown').html(breakdownHTML);

            // Interactive User Star Rating in Form
            $('.user-star-rating i').on('mouseover', function(){ $(this).prevAll().addBack().removeClass('fa-star-o').addClass('fa-star selected'); $(this).nextAll().removeClass('fa-star selected').addClass('fa-star-o'); }).on('mouseout', function(){ var rating = $('#user-rating-value').val(); if(rating > 0){ $('.user-star-rating i').each(function(){ $(this).data('value') <= rating ? $(this).removeClass('fa-star-o').addClass('fa-star selected') : $(this).removeClass('fa-star selected').addClass('fa-star-o'); }); } else { $(this).siblings().addBack().removeClass('fa-star selected').addClass('fa-star-o'); } }).on('click', function(){ $('#user-rating-value').val($(this).data('value')); });

            // Sticky Sidebar
            if ($(window).width() > 768) {
                $("#course-sidebar-sticky").stick_in_parent({ offset_top: 20 });
            }

            // Smart Enroll Button
            var isUserLoggedIn = false;
            $('#enroll-button').on('click', function(e) {
                e.preventDefault();
                if (isUserLoggedIn) {
                    alert('تم التوجيه إلى صفحة الدفع!');
                } else {
                    alert('يجب عليك تسجيل الدخول أولاً لتتمكن من التسجيل في الدورة.');
                    window.location.href = 'contact.html';
                }
            });

        } else {
            // Course not found
            $('#course-details-page').html('<div class="container text-center" style="padding: 50px 0;"><h1>عذراً، هذه الدورة غير موجودة.</h1><p>قد يكون الرابط خاطئاً. يرجى العودة إلى صفحة الدورات.</p><a href="courses.html" class="main-button">العودة إلى الدورات</a></div>');
        }
    }
});
	// Featured Courses Swiper Slider on Homepage
	$(document).ready(function() {
		// Check if the container for the slider exists
		if ($('#featured-courses-list').length && typeof courseDatabase !== 'undefined') {
			
			// 1. Get a selection of courses to display (e.g., first 8)
			const featuredCourseIds = Object.keys(courseDatabase).slice(0, 8);

			// 2. Build the HTML for the course cards
			let coursesHTML = '';
			featuredCourseIds.forEach(id => {
				const course = courseDatabase[id];
				coursesHTML += `
					<div class="swiper-slide">
						<div class="course">
							<a href="course-details.html?id=${id}" class="course-img">
								<img src="${course.image}" alt="${course.title}">
								<i class="course-link-icon fa fa-link"></i>
							</a>
							<a class="course-title" href="course-details.html?id=${id}">${course.title}</a>
							<div class="course-details">
								<span class="course-category">${course.category}</span>
								<span class="course-price course-premium">مدفوعة</span>
							</div>
						</div>
					</div>
				`;
			});
			$('#featured-courses-list').html(coursesHTML);

            // Apply the square-card fix to the newly created cards
            // This is important if this code runs before the general CSS file is fully parsed
            // but it's good practice to ensure consistency.
            // Note: The main CSS file should handle this, this is just a fallback.
            $('#featured-courses-list .course-img').css({
                'position': 'relative',
                'padding-top': '100%'
            });
             $('#featured-courses-list .course-img > img').css({
                'position': 'absolute',
                'top': '0', 'left': '0', 'width': '100%', 'height': '100%', 'object-fit': 'cover'
            });


			// 3. Initialize Swiper
			var swiper = new Swiper('.featured-courses-slider', {
				slidesPerView: 1,
				spaceBetween: 30,
				loop: true,
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
				breakpoints: {
					// when window width is >= 768px
					768: {
						slidesPerView: 2,
					},
					// when window width is >= 992px
					992: {
						slidesPerView: 3,
					},
                    // when window width is >= 1200px
                    1200: {
                        slidesPerView: 4,
                    }
				}
			});
		}
	});
 