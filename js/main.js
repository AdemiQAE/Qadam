if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

if (localStorage.getItem('sidebarPos') === 'right') {
    document.body.classList.add('sidebar-right-layout');
}

window.toggleTheme = function() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const checkboxes = document.querySelectorAll('.theme-switch input');
    checkboxes.forEach(cb => cb.checked = isDark);
};

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        const checkboxes = document.querySelectorAll('.theme-switch input');
        checkboxes.forEach(cb => cb.checked = true);
    }
    const readMoreBtn = document.getElementById('read-more-btn');
    const extraText = document.getElementById('extra-text');
    
    if (readMoreBtn && extraText) {
        extraText.style.display = 'none';

        readMoreBtn.addEventListener('click', () => {
            if (extraText.style.display === 'none') {
                extraText.style.display = 'block';
                extraText.classList.add('highlight-text'); 
                
                readMoreBtn.textContent = 'Жасыру';
                readMoreBtn.style.backgroundColor = '#d9534f'; 
            } else {
                extraText.style.display = 'none';
                extraText.classList.remove('highlight-text');
                
                readMoreBtn.textContent = 'Көбірек оқу';
                readMoreBtn.style.backgroundColor = 'orange';
            }
        });
    }

    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    
    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if (!name || !email || !message) {
                formMessage.style.color = 'red';
                formMessage.textContent = 'Қате: Барлық өрістерді толтырыңыз.';
                return;
            }
            
            formMessage.style.color = 'green';
            formMessage.textContent = `Рақмет, ${name}! Сіздің хабарламаңыз қабылданды. (Дерек: ${email})`;
            contactForm.reset(); 
        });
    }

    const addArticleBtn = document.getElementById('add-article-btn');
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('new-article-title').value.trim();
            const textInput = document.getElementById('new-article-text').value.trim();
            
            if (!titleInput || !textInput) {
                alert("Тақырып пен мәтінді толтыру міндетті!");
                return;
            }
            
            const blogContainer = document.querySelector('.blog');
            
            const newCard = document.createElement('div');
            newCard.className = 'card new-item-animation'; 
            
            newCard.innerHTML = `
                <h3>${titleInput} (Жаңа)</h3>
                <p>${textInput}</p>
                <button class="btn delete-btn" style="background-color: red; margin-top: 10px;">Мақаланы жою</button>
            `;
            
            blogContainer.insertBefore(newCard, blogContainer.firstChild);
            
            document.getElementById('new-article-title').value = '';
            document.getElementById('new-article-text').value = '';
            
            const deleteBtn = newCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                newCard.remove();
            });
        });
    }


    const promoBanner = document.getElementById('promo-banner');
    if (promoBanner) {
        const timerSpan = document.getElementById('promo-timer');
        let timeLeft = 10;
        
        const timer = setInterval(() => {
            timeLeft--;
            if (timerSpan) {
                timerSpan.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                
                promoBanner.style.transition = 'opacity 0.5s';
                promoBanner.style.opacity = '0';
                
                setTimeout(() => {
                    promoBanner.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }

    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const positionBtn = document.getElementById('sidebar-position-btn');
    const headerLeft = document.querySelector('.header-left');
    const headerRight = document.querySelector('.header-right');

    const updateTogglePosition = (pos) => {
        if (!toggleBtn || !headerLeft || !headerRight) return;
        if (pos === 'right') {
            headerRight.appendChild(toggleBtn);
            sidebar.classList.add('right');
            document.body.classList.add('sidebar-right-layout');
        } else {
            headerLeft.insertBefore(toggleBtn, headerLeft.firstChild);
            sidebar.classList.remove('right');
            document.body.classList.remove('sidebar-right-layout');
        }
    };

    if (sidebar) {
        const savedPos = localStorage.getItem('sidebarPos');
        if (savedPos === 'right') {
            updateTogglePosition('right');
        }

        if (toggleBtn && closeBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
                document.body.classList.add('sidebar-open');
            });
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
                document.body.classList.remove('sidebar-open');
            });
        }
        
        if (positionBtn) {
            positionBtn.addEventListener('click', () => {
                const isRight = sidebar.classList.contains('right');
                if (isRight) {
                    localStorage.setItem('sidebarPos', 'left');
                    updateTogglePosition('left');
                } else {
                    localStorage.setItem('sidebarPos', 'right');
                    updateTogglePosition('right');
                }
            });
        }
    }
});
