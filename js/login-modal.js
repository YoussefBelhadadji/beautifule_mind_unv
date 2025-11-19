$(document).ready(function() {
    // Get the modal
    var modal = document.getElementById("loginModal");

    // Get the button that opens the modal
    var btn = document.getElementById("loginButton");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close-button")[0];

    // When the user clicks the button, open the modal
    if (btn) {
        btn.onclick = function() {
            modal.style.display = "flex";
        }
    }

    // When the user clicks on <span> (x), close the modal
    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle Create Account button click
    var createAccountBtn = document.getElementById("createAccountBtn");
    if (createAccountBtn) {
        createAccountBtn.onclick = function() {
            window.location.href = "contact.html"; // Redirect to contact.html
        }
    }

    // You can add form submission logic here for the login button
    // For example:
    // $('#loginForm').submit(function(e) {
    //     e.preventDefault();
    //     var email = $('#loginEmail').val();
    //     var password = $('#loginPassword').val();
    //     console.log('Login attempt with:', email, password);
    //     // Add your AJAX login request here
    //     // On success, close modal: modal.style.display = "none";
    //     // On failure, show error message
    // });
});