$(document).ready(function() {
    // Credentials admin (dalam aplikasi nyata, ini harus disimpan di server)
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };

    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    // Login form submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();

        if (username === adminCredentials.username && password === adminCredentials.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            window.location.href = 'dashboard.html';
        } else {
            alert('Username atau password salah!');
        }
    });

    // Enter key support
    $('#password').on('keypress', function(e) {
        if (e.which === 13) {
            $('#loginForm').submit();
        }
    });
});
