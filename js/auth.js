document.addEventListener('DOMContentLoaded', () => {
    const authNav = document.querySelector('.auth-nav');
    const currentUser = localStorage.getItem('currentUser');

    if (authNav) {
        if (currentUser) {
            authNav.innerHTML = `
                <span style="font-weight:600; color:var(--primary-color);"><span data-i18n="nav-hello">Сәлем</span>, ${currentUser}!</span>
                <button id="logout-btn" class="btn" style="padding: 5px 10px; margin-left: 10px; font-size: 14px; background-color: #d9534f;" data-i18n="nav-logout">Шығу</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        } else {
            authNav.innerHTML = `
                <a href="login.html" class="nav-link" data-i18n="nav-login">Кіру</a>
                <a href="register.html" class="nav-link btn" style="padding: 5px 10px; font-size:14px; margin-left:10px;" data-i18n="nav-register">Тіркелу</a>
            `;
        }
        
        if (typeof updateLanguage === 'function') {
            updateLanguage(localStorage.getItem('lang') || 'kk');
        }
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const errorMsg = document.getElementById('reg-error');

            if (!name || !email || !password) {
                errorMsg.style.color = 'red';
                errorMsg.textContent = 'Барлық өрістерді толтырыңыз!';
                return;
            }
            
            if (password.length < 6) {
                errorMsg.style.color = 'red';
                errorMsg.textContent = 'Құпиясөз кемінде 6 символ болуы керек!';
                return;
            }

            localStorage.setItem('user_' + email, JSON.stringify({ name, email, password }));
            
            errorMsg.style.color = 'green';
            errorMsg.textContent = 'Сәтті тіркелдіңіз! Кіру бетіне өтуде...';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errorMsg = document.getElementById('login-error');

            const userData = localStorage.getItem('user_' + email);
            
            if (userData) {
                const user = JSON.parse(userData);
                if (user.password === password) {
                    errorMsg.style.color = 'green';
                    errorMsg.textContent = 'Сәтті кірдіңіз!';
                    
                    localStorage.setItem('currentUser', user.name);
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    errorMsg.style.color = 'red';
                    errorMsg.textContent = 'Email немесе пароль қате';
                }
            } else {
                errorMsg.style.color = 'red';
                errorMsg.textContent = 'Email немесе пароль қате';
            }
        });
    }
});
