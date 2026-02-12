document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay');
    
    overlay.style.backgroundColor = 'black';
    
    function fadeAndRedirect(target) {
        overlay.style.backgroundColor = 'black';
        setTimeout(() => {
            if (typeof target === "function") {
                window.location.href = target();
            } else {
                window.location.href = target;
            }
        }, 500);
    }
    
    if (sessionStorage.getItem('currentTheme') === 'fun') {
        fadeAndRedirect('../fun/fun.html');
        return;
    } else {
        sessionStorage.setItem('currentTheme', 'professional');
    }
    
    requestAnimationFrame(() => {
        overlay.style.backgroundColor = 'transparent';
    });
    
    const darkModeToggle = document.getElementById('darkmodeToggle');
    
    //lightmode----------------------------------------------------//
    if (localStorage.getItem('lightmode') === 'true') {
        document.body.classList.toggle('light-mode');
        darkModeToggle.textContent = 'Darkmode: OFF';
    }
    //-------------------------------------------------------------//
    
    const settingsBtn = document.getElementById('settingsBtn');
    let settingsExpanded = false;
    
    settingsBtn.addEventListener('click', () => {
        const settings = document.querySelector('.settings');
        settings.style.height = settingsExpanded ? '50px' : '352px';
        settingsExpanded = !settingsExpanded;
    });
    
    const settings = document.getElementById('settingsContainer');
    document.addEventListener('click', (event) => {
        if (settingsExpanded && !settings.contains(event.target)) {
            settings.style.height = '51px';
            settingsExpanded = false;
        }
    });
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        localStorage.setItem("lightmode", document.body.classList.contains('light-mode'));
        
        darkModeToggle.textContent = document.body.classList.contains('light-mode') ? 'Darkmode: OFF' : 'Darkmode: ON';
    });
    
    const rerollHeaderBtn = document.getElementById('rerollHeadBtn');
    
    rerollHeaderBtn.addEventListener('click', () => {
        window.changeSim();
    });
  
    const autoRerollBtn = document.getElementById('stopHeadReroll');
    let autoReroll = true;
    
    autoRerollBtn.addEventListener('click', () => {
        autoReroll = !autoReroll;
        autoRerollBtn.textContent = autoReroll ? 'Auto Reroll: ON' : 'Auto Reroll: OFF';
    });
    
    const rerollPeriods = [5, 10, 15, 30, 60, 120];
    let rerollPeriod = 1;
    
    let intervalId;

    function startAutoReroll() {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            if (autoReroll) {
                window.changeSim();
            }
        }, rerollPeriods[rerollPeriod] * 1000);
    }
    
    startAutoReroll();
    
    const autoRerollPeriod = document.getElementById('autoRerollPeriod');
    
    autoRerollPeriod.addEventListener('click', () => {
        rerollPeriod = (rerollPeriod + 1) % rerollPeriods.length;
        autoRerollPeriod.textContent = 'Reroll Frequency: ' + rerollPeriods[rerollPeriod] + 's';
        startAutoReroll();
    });
    
    const loadFunTheme = document.getElementById('funModeBtn');
    
    loadFunTheme.addEventListener('click', () => {
        overlay.style.backgroundColor = 'black';
       
        sessionStorage.setItem('currentTheme', 'fun');
        
        setTimeout(() => {
            
            window.location.href = "../fun/fun.html";
        }, 500);
    });
    
    
    let autoTheme = localStorage.getItem('autoTheme');
    const autoThemeBtn = document.getElementById('autoThemeBtn');
    autoThemeBtn.textContent = "Saved Theme: " + autoTheme;
    
    autoThemeBtn.addEventListener('click', () => {
        switch (autoTheme) {
            case "professional":
                localStorage.setItem('autoTheme', 'fun');
                autoTheme = localStorage.getItem('autoTheme');
                autoThemeBtn.textContent = "Saved Theme: " + autoTheme;
                break;
            case "fun":
                localStorage.setItem('autoTheme', 'none');
                autoTheme = localStorage.getItem('autoTheme');
                autoThemeBtn.textContent = "Saved Theme: " + autoTheme;
                break;
            case "none":
                localStorage.setItem('autoTheme', 'professional');
                autoTheme = localStorage.getItem('autoTheme');
                autoThemeBtn.textContent = "Saved Theme: " + autoTheme;
                break;
        }
    });
    
    
    const homeBtn = document.getElementById('home');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            overlay.style.backgroundColor = 'black';
            
            setTimeout(() => {
                if (document.body.classList.contains('fun-mode')) {
                    window.location.href = "../fun/fun.html";
                } else {
                    window.location.href = "../professional/professional.html";
                }
            }, 500);
        });
    }
    
    const navButtons = {
        home: () => document.body.classList.contains('fun-mode') ? "../fun/fun.html" : "../professional/professional.html",
        aboutMeBtn: "../topics/aboutme.html",
        aboutmeCard: "../topics/aboutme.html",
        ContactmeBtn: "../topics/contactme.html",
        contactmeCard: "../topics/contactme.html",
        gameDevPrjBtn: "../topics/gamedev.html",
        gamedevCard: "../topics/gamedev.html",
        programmingPrjBtn: "../topics/programming.html",
        programmingCard: "../topics/programming.html",
        WritePrjBtn: "../topics/writing.html",
        writingCard: "../topics/writing.html",
        YTChannelBtn: "../topics/youtube.html",
        ytCard: "../topics/youtube.html"
    };
    
    
    
    // Attach event listeners in one loop
    Object.entries(navButtons).forEach(([id, target]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => fadeAndRedirect(target));
        }
    });
    
});































