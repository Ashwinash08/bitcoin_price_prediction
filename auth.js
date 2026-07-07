document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            const msgBox = document.getElementById('auth-message');

            if (password !== confirm) {
                msgBox.innerHTML = '<span class="negative">Passwords do not match</span>';
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name: fullName, email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    msgBox.innerHTML = '<span class="positive">' + data.message + ' Redirecting...</span>';
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    msgBox.innerHTML = '<span class="negative">' + data.error + '</span>';
                }
            } catch (err) {
                msgBox.innerHTML = '<span class="negative">Server error occurred. Make sure the backend is running.</span>';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const msgBox = document.getElementById('auth-message');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    msgBox.innerHTML = '<span class="positive">Login successful! Opening Dashboard...</span>';
                    // Store user data in local storage
                    localStorage.setItem('user_name', data.full_name);
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    msgBox.innerHTML = '<span class="negative">' + data.error + '</span>';
                }
            } catch (err) {
                msgBox.innerHTML = '<span class="negative">Server error occurred. Make sure the backend is running.</span>';
            }
        });
    }
});
