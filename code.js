document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay');
    const funChoiceBtn = document.getElementById('funBtnChoice');
    const professionalChoiceBtn = document.getElementById('professionalBtnChoice');
    const rememberChoiceBtn = document.getElementById('rememberChoiceButton');
    
    // Fade-in effect on page load
    overlay.style.backgroundColor = 'black';
    
    
    // --- Helper for fading + redirect ---
    function fadeAndRedirect(url) {
        overlay.style.backgroundColor = 'black';
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }
    
    // --- Check stored choice ---
    
    const autoTheme = sessionStorage.getItem('currentTheme') !== null ? sessionStorage.getItem('currentTheme') : localStorage.getItem('autoTheme');
    
    if (autoTheme === "fun") {
        sessionStorage.setItem('isFun', true);
        fadeAndRedirect('../fun/fun.html');
        return;
    } else if (autoTheme === "professional") {
        sessionStorage.setItem('isFun', false);
        fadeAndRedirect('../professional/professional.html');
        return;
    }
    
    requestAnimationFrame(() => {
        overlay.style.backgroundColor = 'transparent';
    });
    
    // --- Click handlers ---
    funChoiceBtn?.addEventListener('click', () => {
        if (rememberChoiceBtn.checked) {
            localStorage.setItem('autoTheme', 'fun');
        } else {
            localStorage.setItem('autoTheme', 'none');
        }
        sessionStorage.setItem('currentTheme', 'fun');
        fadeAndRedirect("../fun/fun.html");
    });
    
    professionalChoiceBtn?.addEventListener('click', () => {
        if (rememberChoiceBtn.checked) {
            localStorage.setItem('autoTheme', 'professional');
        } else {
            localStorage.setItem('autoTheme', 'none');
        }
        sessionStorage.setItem('currentTheme', 'professional');
        fadeAndRedirect("../professional/professional.html");
    });
});
