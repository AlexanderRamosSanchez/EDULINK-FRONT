document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const backToLoginButton = document.getElementById('backToLogin');

    // Manejar el envío del formulario de registro
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar el envío normal del formulario

        // Validar el formulario usando la validación de Bootstrap
        if (!registerForm.checkValidity()) {
            registerForm.classList.add('was-validated');
            return;
        }

        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
            });
            return;
        }

        // Enviar los datos al servidor
        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en el registro');
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Usuario creado exitosamente',
            }).then(() => {
                // Volver al formulario de inicio de sesión
                window.location.href = '/';
            });
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el usuario',
            });
        });
    });

    // Volver al formulario de inicio de sesión
    backToLoginButton.addEventListener('click', function() {
        window.location.href = '/';
    });
});
