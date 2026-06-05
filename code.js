//global constants
const params = new URLSearchParams(window.location.search);
const overlay = document.getElementById('overlay');
const main = document.querySelector('main');

//helper functions://

//takes roman numeral string gives integer
function romanToInt(roman) {
  if (roman === null) {
    return null;
  }
  
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let total = 0, prev = 0;
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const val = map[roman[i]] || 0;
    total += val < prev ? -val : val;
    prev = val;
  }
  
  return total;
}

//makes the given element transition over
//the given time frame to the given color
window.fadeTo = function(color, object, time) {
  return new Promise(resolve => {
    const prevTransition = object.style.transition;
    function done() {
      object.removeEventListener('transitionend', done);
      object.style.transition = prevTransition;
      resolve();
    }
    object.addEventListener('transitionend', done);

    // trigger fade
    object.style.transition = `background-color ${time}s ease`;
    object.style.backgroundColor = color;
  });
};

/*takes a list of items and a mapping range and
calculates the % visible of each object in order
to*///update '--visibility' variable
window.updateVisibility = function(cards, range = [0, 1]) {
  //Checking for inconsistencies in the
  //card's parent container and returning
  if ((() => {
    const setParent = cards[0].parentElement;
    for (const card of cards) {
      if (card.parentElement !== setParent) return true;
    }
    return false;
  })()) return;
  
  const mainRect = cards[0].parentElement.getBoundingClientRect();
  
  cards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    
    const visibleHeight = Math.max(
      0,
      Math.min(
        cardRect.bottom,
        mainRect.bottom
      ) - Math.max(
        cardRect.top,
        mainRect.top
      )
    );
    
    const percentVisible = 1 - visibleHeight / cardRect.height;
    
    const n = range.slice(0, 2);
    const mappedValue = (n[0] - percentVisible) / (n[1] - n[0]) + 1;
    
    const clamped = Math.min(Math.max(mappedValue, 0), 1);
    
    card.style.setProperty('--visibility', clamped);
  });
};


//initializing webpage
(function initializations() {
  //Initializing the overlay, making it black,
  //then fading to tranparent for a load effect.
  (function initOverlay() {
    // force initial state explicitly
    overlay.style.backgroundColor = 'black';
    
    //setting the overlay late because satisfying;
    setTimeout(() => {
      window.fadeTo('transparent', overlay);
    }, 250);
  })();
  
  //initializing theme toggle:
  (function themeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('lightmode');
    });
  })();
})();

//initialize animations and neon background
//based on limitations set by '?minimal' in link.
(function initFun() {
  //local constants
  const minimalValue = romanToInt(params.get("minimal"));
  const cards = document.querySelectorAll('.card');
  
  //Cards animations
  const patterns = [ //0 -> left, 1 -> right
    [
      [1],
      [0]
    ], // all left or right
    [
      [1, 0],
      [0, 1]
    ], // alternating
    [
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 0],
      [1, 0, 0]
    ], // patterned by 3s
    [
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [1, 1, 1, 0],
      [0, 1, 1, 1],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [1, 0, 0, 1],
      [0, 1, 1, 0]
    ]  // patterned by 4s
  ];
  let possiblePatterns = [];
  
  //minimalValue restrictions
  //zero edge case
  if (minimalValue === 0) return;
  
  //apply restrictions
  (function restrictions() {
    
    //null edge case
    if (minimalValue === null) {
      possiblePatterns = patterns.flat();
      return;
    }
    
    //Out of bounds edge case
    if (minimalValue >= patterns.length) return;
    
    //In bounds handling
    possiblePatterns = patterns.slice(0, patterns.length - minimalValue).flat();
  })();
  
  //run patterns with restrictions
  (function runPatterns() {
    //No Patterns edge case
    if (!possiblePatterns.length) return;
    
    //choosing pattern and making machine usefull:
    const chosenPattern = possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)];
    const patternCalculated = chosenPattern.map(x => x * 2 - 1);
    
    //running pattern:
    cards.forEach((card, i) => {
      card.classList.add("no-transition");
      card.style.transform = `translateX(${patternCalculated[i % patternCalculated.length] * 150}%)`;
      
      setTimeout(() => {
        card.classList.remove("no-transition");
        card.style.transform = "translateX(0)";
      }, i * 150 + 600);
    });
  })();
  
  (function scrollingCardUpdate() {
    if (!possiblePatterns.length) return;
    
    window.updateVisibility(cards, [0.4, 0.9]);
    
    let ticking = false;
    main.addEventListener('scroll', () => {
      //Event spam protection
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
        });
        
        window.updateVisibility(cards, [0.4, 0.9]);
      }
    });
  })();

  
  //Skipping if minimalValue isn't null
  if (minimalValue !== null) return;
  
  //starting background animation
  window.startNeonBackground();
  
  (async function konamiTime() {
    const konamiCode = document.createElement('script');
    konamiCode.id = 'konamicode';
    konamiCode.type = 'module';
    konamiCode.src = '/konamicode.js';
    konamiCode.onload = () => konamiCode.remove();
    document.querySelector('head').appendChild(konamiCode);
  })();
})();


//prevent <a> href from redirecting
//before fade out function ceases.
(function aRefIntercept() {
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', async (e) => {
      const href = link.getAttribute('href');
      
      // ignore special cases
      if (
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
        link.target === '_blank' ||
        href.startsWith('#') ||
        href.startsWith('mailto:') || 
        href.startsWith('tel:')
      ) return;
      
      e.preventDefault();
      
      await window.fadeTo('black', overlay, 0.5);
      
      // check for custom warning
      const warning = link.dataset.warning;
      if (warning) {
        const ok = confirm(warning.replace(/\\n/g, '\n'));
        if (!ok) {
          setTimeout(async () => {
            await window.fadeTo('transparent', overlay, 1);
          }, 100);
          
          return;
        } // user cancelled
      }
      
      // trigger fade-out and redirect
      
      window.location.href = href;
    });
  });
})();


























