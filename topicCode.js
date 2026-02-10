document.addEventListener('DOMContentLoaded', () => {
    //fetching content---------------------------------------------//
    async function fetchNamedRange(rangeName) {
        const sheetId = '1A5JU68ggjZTf8n21yZG-uwbQPMjmHa6mjWU1mmjCigo';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=${rangeName}`;
        
        const res = await fetch(url);
        let text = await res.text();
        
        // Strip the Google wrapper function
        const jsonText = text.match('/google\.visualization\.Query\.setResponse\((.*)\);/s')[1];
        const data = JSON.parse(jsonText);
        
        // Return the first column of each row
        return data.table.rows.map(r => r.c[0]?.v || '');
    }
    //-------------------------------------------------------------//
    
    
    //overlay------------------------------------------------------//
    const overlay = document.querySelector('.overlay');
    
    overlay.style.backgroundColor = 'black';
    
    requestAnimationFrame(() => {
        overlay.style.backgroundColor = 'transparent';
    });
    //-------------------------------------------------------------//
    
    //settings-----------------------------------------------------//
    const settingsBtn = document.getElementById('settingsBtn');
    let settingsExpanded = false;
    
    settingsBtn.addEventListener('click', () => {
        const settings = document.querySelector('.settings');
        settings.style.height = settingsExpanded ? '51px' : '302px';
        settingsExpanded = !settingsExpanded;
    });
    
    const settings = document.getElementById('settingsContainer');
    document.addEventListener('click', (event) => {
        if (settingsExpanded && !settings.contains(event.target)) {
            settings.style.height = '51px';
            settingsExpanded = false;
        }
    });
    
    const darkModeToggle = document.getElementById('darkmodeToggle');
    
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
        
        setTimeout(() => {
            document.body.classList.toggle('fun-mode');
            loadFunTheme.textContent = document.body.classList.contains('fun-mode') ? 'Load Professional Theme' : 'Load Fun Theme';
            overlay.style.backgroundColor = 'transparent';
        }, 500);
    });
    //------------------------------------------------------------------//
    
    //lightmode----------------------------------------------------//
    if (localStorage.getItem('lightmode') === 'true') {
        document.body.classList.toggle('light-mode');
        darkModeToggle.textContent = 'Darkmode: OFF';
    }
    //-------------------------------------------------------------//
});































