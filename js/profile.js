// js/profile.js

$(document).ready(function() {
    
    // Check if we are on the profile page and firebase is available
    if ($('#profile-page').length && typeof firebase !== 'undefined') {
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Listen for authentication state changes
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in. Fetch and display their data.
                fetchUserProfile(user.uid);
            } else {
                // No user is signed in. Redirect to login/register page.
                console.log("No user signed in. Redirecting...");
                window.location.href = 'contact.html'; 
            }
        });

        async function fetchUserProfile(uid) {
            try {
                // Fetch main user data and profile data in parallel
                const userDocPromise = db.collection('users').doc(uid).get();
                const specialistProfilePromise = db.collection('specialists_profiles').doc(uid).get();
                const patientProfilePromise = db.collection('patients_profiles').doc(uid).get();

                const [userDoc, specialistDoc, patientDoc] = await Promise.all([userDocPromise, specialistProfilePromise, patientProfilePromise]);

                if (userDoc.exists) {
                    const userData = userDoc.data();

                    // --- Populate Sidebar and General Info ---
                    $('#profile-main-name').text(userData.fullName);
                    $('#info-name').text(userData.fullName);
                    $('#info-email').text(userData.email);
                    $('#info-phone').text(userData.phone || 'غير متوفر'); // Use default text if phone is not available

                    // --- Display content based on user role ---
                    const role = userData.role;
                    let roleText = '';
                    
                    if (role === 'specialist' && specialistDoc.exists) {
                        roleText = 'أخصائي';
                        const profileData = specialistDoc.data();
                        $('#info-specialty').text(profileData.specialty);
                        $('#info-experience').text(profileData.experience_years || 'غير متوفر');
                        $('#info-license').text(profileData.license_number || 'غير متوفر');
                        $('#info-bio').text(profileData.bio || 'لم يتم تقديم نبذة.');
                        $('.specialist-only').show();
                    } 
                    else if (role.startsWith('patient') && patientDoc.exists) {
                        roleText = 'ملف مريض';
                        const profileData = patientDoc.data();
                        $('#info-dob').text(profileData.dateOfBirth);
                        $('#info-case-summary').text(profileData.caseSummary);
                        $('.patient-only').show();
                    }
                    else if (role === 'guardian') {
                         roleText = 'ولي أمر';
                         // In a real app, you would fetch the child's data here.
                         $('.guardian-only').show();
                    }
                    
                    $('#profile-main-role').text(roleText);
                    
                    // --- Show the content and hide loading spinner ---
                    $('#profile-loading').hide();
                    $('#profile-data-view').fadeIn();

                } else {
                    console.error("No such user document!");
                    $('#profile-loading').html('<p>عذراً، لم نتمكن من العثور على بياناتك.</p>');
                }

            } catch (error) {
                console.error("Error fetching user profile: ", error);
                $('#profile-loading').html('<p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>');
            }
        }

        // Logout button on profile page
        $('#logout-button-profile').on('click', function(e) {
            e.preventDefault();
            auth.signOut();
        });

    } // End of check for profile page

}); // End of document ready