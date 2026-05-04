const translations = {
    // Жалпы (Ортақ) / General
    "menu-home": { kk: "Басты бет", ru: "Главная", en: "Home" },
    "menu-about": { kk: "Біз туралы", ru: "О нас", en: "About Us" },
    "menu-services": { kk: "Қызметтер", ru: "Услуги", en: "Services" },
    "menu-blog": { kk: "Блог", ru: "Блог", en: "Blog" },
    "menu-contact": { kk: "Байланыс", ru: "Контакты", en: "Contact" },
    "nav-login": { kk: "Кіру", ru: "Войти", en: "Login" },
    "nav-register": { kk: "Тіркелу", ru: "Регистрация", en: "Register" },
    "nav-logout": { kk: "Шығу", ru: "Выйти", en: "Logout" },
    "nav-hello": { kk: "Сәлем", ru: "Привет", en: "Hello" },
    "footer-text": { kk: "© 2026 Qadam Online Courses. Барлық құқықтар қорғалған.", ru: "© 2026 Qadam Online Courses. Все права защищены.", en: "© 2026 Qadam Online Courses. All rights reserved." },

    // Басты бет / Home
    "home-promo": { kk: "Назар аударыңыз! Барлық курстарға акция", ru: "Внимание! Акция на все курсы закончится через", en: "Attention! Discount on all courses ends in" },
    "home-promo-sec": { kk: "секундта аяқталады!", ru: "секунд!", en: "seconds!" },
    "home-hero-title": { kk: "Жаңа мамандықты бізбен бірге меңгеріңіз", ru: "Освойте новую профессию вместе с нами", en: "Master a new profession with us" },
    "home-hero-desc": { kk: "Qadam - үздік онлайн білім беру платформасы. Өз қадамыңызды бүгін жасаңыз!", ru: "Qadam - лучшая образовательная онлайн-платформа. Сделайте свой шаг сегодня!", en: "Qadam is the best online education platform. Make your step today!" },
    "home-btn": { kk: "Курстарды көру", ru: "Посмотреть курсы", en: "View courses" },

    // Біз туралы / About
    "about-title": { kk: "Біз туралы", ru: "О нас", en: "About Us" },
    "about-p1": { kk: "Qadam - бұл жаңа заман талабына сай, креативті және сапалы білім беруді мақсат тұтқан онлайн платформа. Біздің мақсат - әрбір адамға сапалы IT мамандықтарын қолжетімді ету.", ru: "Qadam — это онлайн-платформа, которая стремится предоставлять креативное и качественное образование. Наша цель — сделать качественные ИТ-специальности доступными для всех.", en: "Qadam is an online platform aiming to provide creative and quality education. Our goal is to make quality IT professions accessible to everyone." },
    "about-p2": { kk: "Платформа 2024 жылы энтузиастар тобымен құрылған. Қазіргі таңда бізде 5000-нан астам студент оқып, өз мақсаттарына жетті.", ru: "Платформа была основана в 2024 году группой энтузиастов. На сегодняшний день у нас обучается более 5000 студентов, достигнувших своих целей.", en: "The platform was founded in 2024 by a group of enthusiasts. Currently, over 5,000 students have studied with us and achieved their goals." },
    "about-p3": { kk: "Біздің сарапшы менторлар заманауи бағдарламалар көмегімен нақты жобаларды жасауға баулиды!", ru: "Наши эксперты-менторы обучают созданию реальных проектов с помощью современных программ!", en: "Our expert mentors teach how to create real projects using modern software!" },
    "about-extra": { kk: "Бұл біздің тарихымыз туралы толығырақ ақпарат. Біз әрқашан алға ұмтылып, жаңадан шыққан технологияларды студенттерімізге бірінші болып үйретеміз. Бізге қосыл және мықты маман бол!", ru: "Это подробная информация о нашей истории. Мы всегда стремимся вперед и первыми обучаем студентов новым технологиям. Присоединяйтесь к нам и станьте отличным специалистом!", en: "This is detailed info about our history. We always strive forward and teach newly emerged technologies first to our students. Join us and become a great specialist!" },
    "about-read-more": { kk: "Көбірек оқу", ru: "Читать больше", en: "Read more" },
    "about-hide": { kk: "Жасыру", ru: "Скрыть", en: "Hide" },

    // Қызметтер / Services
    "services-title": { kk: "Біздің Курстар (Қызметтер)", ru: "Наши Курсы (Услуги)", en: "Our Courses (Services)" },
    "services-c1-t": { kk: "Frontend Разработка", ru: "Фронтенд Разработка", en: "Frontend Development" },
    "services-c1-p": { kk: "HTML, CSS, JavaScript және React.js арқылы заманауи веб-сайттар мен қосымшалар жасауды үйренесіз.", ru: "Вы научитесь создавать современные веб-сайты и приложения с использованием HTML, CSS, JavaScript и React.js.", en: "You will learn how to create modern websites and apps using HTML, CSS, JavaScript, and React.js." },
    "services-c2-t": { kk: "UX/UI Дизайн", ru: "UX/UI Дизайн", en: "UX/UI Design" },
    "services-c2-p": { kk: "Figma бағдарламасын меңгеріп, қолданушыға ыңғайлы әрі әдемі интерфейстердің дизайнын сызыңыз.", ru: "Освойте Figma и проектируйте удобные и красивые пользовательские интерфейсы.", en: "Master Figma and design user-friendly and beautiful UI interfaces." },
    "services-c3-t": { kk: "Python Backend", ru: "Python Бэкенд", en: "Python Backend" },
    "services-c3-p": { kk: "Python тілі және Django фреймворкі арқылы қуатты серверлік логикалар мен API құруды үйреніңіз.", ru: "Научитесь создавать мощную серверную логику и API с помощью Python и Django.", en: "Learn to build powerful server-side logic and APIs using Python and Django." },

    // Блог / Blog
    "blog-title": { kk: "Блог", ru: "Блог", en: "Blog" },
    "blog-add-btn": { kk: "Жаңа мақала қосу", ru: "Добавить статью", en: "Add new article" },
    "blog-ph-title": { kk: "Мақала тақырыбы", ru: "Название статьи", en: "Article title" },
    "blog-ph-text": { kk: "Мақаланың қысқаша мәтіні", ru: "Краткий текст статьи", en: "Short article text" },
    "blog-c1-t": { kk: "Қай бағдарламалау тілінен бастаған дұрыс?", ru: "С какого языка программирования лучше начать?", en: "Which programming language to start with?" },
    "blog-c1-p": { kk: "Егер сіз IT саласына жаңадан қадам бассаңыз, қай тілді таңдауда қиналуыңыз мүмкін. Келіңіз қарастырайық...", ru: "Если вы новичок в ИТ, вам может быть сложно выбрать язык. Давайте рассмотрим...", en: "If you are new to IT, choosing a language might be hard. Let's review..." },
    "blog-c2-t": { kk: "UX пен UI айырмашылығы", ru: "Разница между UX и UI", en: "Difference between UX and UI" },
    "blog-c2-p": { kk: "Дизайн әлемінде жиі шатасатын екі ұғым бар. Олар бір-бірін толықтырса да, атқаратын қызметтері бөлек...", ru: "В мире дизайна эти два понятия часто путают. Хоть они и дополняют друг друга...", en: "In the design world, two concepts are often confused..." },
    "blog-c3-t": { kk: "Резюмені қалай дұрыс жасау керек?", ru: "Как правильно составить резюме?", en: "How to create a proper resume?" },
    "blog-c3-p": { kk: "Алғашқы жұмысыңызды табу үшін тек білім аздық етеді. Дұрыс резюме - сіздің визиткаңыз...", ru: "Для первой работы одних знаний недостаточно. Хорошее резюме — ваша визитная карточка...", en: "Knowledge alone is not enough for your first job. A proper resume is your business card..." },
    "blog-read": { kk: "Толық оқу", ru: "Читать", en: "Read more" },

    // Байланыс / Contact
    "contact-title": { kk: "Бізбен байланысу", ru: "Связаться с нами", en: "Contact Us" },
    "contact-label-name": { kk: "Аты-жөніңіз:", ru: "Ваше имя:", en: "Your Name:" },
    "contact-label-email": { kk: "Email адресіңіз:", ru: "Ваш Email:", en: "Your Email:" },
    "contact-label-msg": { kk: "Хабарламаңыз:", ru: "Ваше сообщение:", en: "Your Message:" },
    "contact-btn": { kk: "Жіберу", ru: "Отправить", en: "Submit" },
    "contact-ph-name": { kk: "Өз атыңызды жазыңыз", ru: "Напишите ваше имя", en: "Write your name" },
    "contact-ph-email": { kk: "example@mail.com", ru: "example@mail.com", en: "example@mail.com" },
    "contact-ph-msg": { kk: "Хабарламаңызды осында қалдырыңыз", ru: "Оставьте ваше сообщение здесь", en: "Leave your message here" },

    // Формалар (Auth) / Auth Forms
    "reg-title": { kk: "Жүйеге тіркелу", ru: "Регистрация в системе", en: "System Registration" },
    "reg-label-name": { kk: "Атыңыз:", ru: "Ваше имя:", en: "Your Name:" },
    "reg-label-pass": { kk: "Құпиясөз:", ru: "Пароль:", en: "Password:" },
    "log-title": { kk: "Жүйеге кіру", ru: "Вход в систему", en: "System Login" },
    "log-ph-email": { kk: "Тіркелген email", ru: "Зарегистрированный email", en: "Registered email" },
    "log-ph-pass": { kk: "Құпиясөз", ru: "Пароль", en: "Password" },
    "reg-ph-name": { kk: "Атыңызды енгізіңіз", ru: "Введите ваше имя", en: "Enter your name" },
    "reg-ph-email": { kk: "example@mail.com", ru: "example@mail.com", en: "example@mail.com" },
    "reg-ph-pass": { kk: "Кемінде 6 символ", ru: "Не менее 6 символов", en: "At least 6 characters" },
};

function updateLanguage(lang) {
    localStorage.setItem('lang', lang);
    
    const langSelect = document.getElementById('language-switch');
    if (langSelect && langSelect.value !== lang) {
        langSelect.value = lang;
    }

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if(el.type === "submit" || el.type === "button") {
                   el.value = translations[key][lang];
                } else {
                   el.placeholder = translations[key][lang];
                }
            } else {
                el.textContent = translations[key][lang];
            }
        }
    });

    const pageTitleMap = {
        'Басты бет': 'menu-home',
        'Біз туралы': 'menu-about',
        'Қызметтер': 'menu-services',
        'Байланыс': 'menu-contact',
        'Блог': 'menu-blog'
    };
    const titleEl = document.getElementById('current-page-title');
    if(titleEl) {
        const tKey = titleEl.getAttribute('data-i18n');
        if(tKey && translations[tKey]) {
            document.title = translations[tKey][lang] + " - Qadam";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let savedLang = localStorage.getItem('lang') || 'kk';
    
    const langSelect = document.getElementById('language-switch');
    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            updateLanguage(e.target.value);
        });
    }

    updateLanguage(savedLang);
});
