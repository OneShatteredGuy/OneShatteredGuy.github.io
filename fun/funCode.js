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
  
  if (sessionStorage.getItem('currentTheme') === 'professional') {
        fadeAndRedirect('../professional/professional.html');
        return;
    } else {
        sessionStorage.setItem('currentTheme', 'fun');
    }

  requestAnimationFrame(() => {
    overlay.style.backgroundColor = 'transparent';
  });

  const toggleButtons = document.querySelectorAll('.modetogglebutton');
  
  const stack = document.querySelector('.slideAnimation');
  
  function slideUp() {
    const emojis = stack.children;
    stack.appendChild(emojis[0]);
    
    stack.style.animation = 'none';
    
    void stack.offsetWidth;
    
    stack.style.animation = 'slideUp 0.3s forwards';
  }
  
  let epilepticProgress = {
    value: 0,
    discovered: false,
    setter(newVal) {
      this.value = newVal;
      
      if (this.value >= 100 && !this.discovered) {
        this.discovered = true;
        const epilepsyCard = document.getElementById('epileptic...');
        
        showAchievement(epilepsyCard);
      }
    }
  };
  
  let gamblingProgress = {
    value: 0,
    discovered: false,
    setter(newVal) {
      this.value = newVal;
      
      if (this.value >= 100 && !this.discovered) {
        this.discovered = true;
        const gamblingCard = document.getElementById('gambling...');
        
        showAchievement(gamblingCard);
      }
    }
  };
  
  let epilepticNightmareProgress = {
    value: 0,
    discovered: false,
    setter(newVal) {
      this.value = newVal;
      
      if (this.value >= 1000 && !this.discovered) {
        this.discovered = true;
        const epilepsyCard = document.getElementById('epilepticNightmare...');
        
        showAchievement(epilepsyCard);
      }
    }
  };
  
  let professionalGamblingProgress = {
    value: 0,
    discovered: false,
    setter(newVal) {
      this.value = newVal;
      
      if (this.value >= 1000 && !this.discovered) {
        this.discovered = true;
        const gamblingCard = document.getElementById('professionalGambling...');
        
        showAchievement(gamblingCard);
      }
    }
  };
  
  
  shownCardIds = [];
  function showAchievement(achievementCard) {
    let i=0;
    while (shownCardIds.includes(i)) {
      i++;
    }
    const bottomStyle = `${i * 10}%`;
    shownCardIds.push(i);
    
    achievementCard.style.bottom = bottomStyle;
    
    setTimeout(() => {
      achievementCard.style.bottom = '-20%';
      
      shownCardIds.splice(shownCardIds.indexOf(i), 1);
    }, 6 * 1000);
  }
  
  
  
  
  const changeSceneButton = document.getElementById('changeSceneButton');
  
  toggleButtons.forEach(toggleButton => {
    toggleButton.addEventListener('click', () => {
      epilepticProgress.setter(epilepticProgress.value + 1);
      epilepticNightmareProgress.setter(epilepticNightmareProgress.value + 1);
      
      document.body.classList.toggle('light-mode');
      
      localStorage.setItem("lightmode", document.body.classList.contains('light-mode'));
      
      slideUp();
    });
  });
  
  changeSceneButton.addEventListener('click', () => {
    gamblingProgress.setter(gamblingProgress.value + 1);
    professionalGamblingProgress.setter(professionalGamblingProgress.value + 1);
    
    window.changeSim();
  });
  
  const professionalModeBtn = document.getElementById('proffesionalModeButton');
  
  professionalModeBtn.addEventListener('click', () => {
     const card = document.querySelector('.overlay');
        overlay.style.backgroundColor = 'black';
    
        sessionStorage.setItem('currentTheme', 'professional');
    
        setTimeout(() => {
            window.location.href = "../professional/professional.html";
        }, 500);
  });
  
  //lightmode----------------------------------------------------//
    if (localStorage.getItem('lightmode') === 'true') {
      document.body.classList.toggle('light-mode');
      slideUp();
    }
    //-------------------------------------------------------------//
  
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
        ContactmeBtn: "../topics/contactme.html",
        gameDevPrjBtn: "../topics/gamedev.html",
        programmingPrjBtn: "../topics/programming.html",
        WritePrjBtn: "../topics/writing.html",
        YTChannelBtn: "../topics/youtube.html"
    };
    
    // Attach event listeners in one loop
    Object.entries(navButtons).forEach(([id, target]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => fadeAndRedirect(target));
        }
    });
  
});






































