//global constants
const params = new URLSearchParams(window.location.search);
const overlay = document.getElementById('overlay');

(function initOverlay() {
  // force initial state explicitly
  overlay.style.backgroundColor = 'black';
  
  //setting the overlay late because satisfying;
  setTimeout(() => {
    fadeTo('transparent', overlay);
  }, 250);
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
  
  //Skipping if minimalValue isn't null
  if (minimalValue !== null) return;
  
  //starting background animation
  window.startNeonBackground();
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
      
      await fadeTo('black', overlay, 0.5);
      
      // check for custom warning
      const warning = link.dataset.warning;
      if (warning) {
        const ok = confirm(warning.replace(/\\n/g, '\n'));
        if (!ok) {
          setTimeout(async () => {
            await fadeTo('transparent', overlay, 1);
          }, 100);
          
          return;
        } // user cancelled
      }
      
      // trigger fade-out and redirect
      
      window.location.href = href;
    });
  });
})();


//helper functions
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

function fadeTo(color, object, time) {
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
}





























