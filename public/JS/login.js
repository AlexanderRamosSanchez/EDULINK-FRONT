// login.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    const confirmLogout = document.getElementById('confirmLogout');
    const registerBtn = document.getElementById('registerBtn');
    
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!loginForm.checkValidity()) {
            e.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store login state and user info
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userId', data.user.id);
                sessionStorage.setItem('username', data.user.username);

                // Show main content
                loginContainer.style.display = 'none';
                mainContent.style.display = 'block';

                // Initialize products table after content is visible
                setTimeout(() => {
                    if (typeof initializeProductsTable === 'function') {
                        initializeProductsTable();
                    }
                }, 100);
            } else {
                showError('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Error al conectar con el servidor');
        }
    });

    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';
        
        setTimeout(() => {
            if (typeof initializeProductsTable === 'function') {
                initializeProductsTable();
            }
        }, 100);
    }

    // Logout handling
    confirmLogout.addEventListener('click', function() {
        // Clear session storage
        sessionStorage.clear();
        
        // Reset form
        loginForm.reset();
        loginForm.classList.remove('was-validated');
        
        // Show login container
        loginContainer.style.display = 'block';
        mainContent.style.display = 'none';
        
        // Destroy DataTable if it exists
        if (typeof productsTable !== 'undefined' && productsTable !== null) {
            productsTable.destroy();
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('logoutModal'));
        modal.hide();
    });

    // Redirect to register page
    registerBtn.addEventListener('click', function() {
        window.location.href = '/register';
    });

    // Helper function to show errors
    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        loginForm.insertAdjacentElement('beforebegin', alert);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});