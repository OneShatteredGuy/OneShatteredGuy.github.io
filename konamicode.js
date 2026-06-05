//STEP 1: listen for konami code.
await (async function activationListener() {
    
    const konamiSequence = {
        sequence: ['u','u','d','d','l','r','l','r','B','A'],
        map: {
            l: ['ArrowLeft', 'a'],
            r: ['ArrowRight', 'd'],
            u: ['ArrowUp', 'w'],
            d: ['ArrowDown', 's'],
            A: ['a'],
            B: ['b'],
        },
        
        sequenceComplete: 0,
        checkSequence(key) {
            const expected = this.map[this.sequence[this.sequenceComplete]];
            if (expected?.includes(key)) {
                this.sequenceComplete++;
                if (this.sequenceComplete === this.sequence.length) return true;
            } else {
                this.sequenceComplete = 0; // reset on wrong key
            }
            return false;
        }
    };
    
    await new Promise((resolve) => {
        const onKeyEvent = (e) => {
            if (konamiSequence.checkSequence(e.key)) {
                document.removeEventListener('keydown', onKeyEvent);
                resolve();
            }
        };
        document.addEventListener('keydown', onKeyEvent);
    });
})();

//STEP 2: murder the webpage.
await (async function wipeBodyHTML() {
    await window.fadeTo('black', document.getElementById('overlay'), 2);
    
    Object.keys(window.cleanup).forEach(object => {
        window.cleanup[object]();
    });
    
    document.body.innerHTML = '';
    
    console.log(window.cleanup);
})();

await (function showReward() {
    document.body.textContent = 'Congratulations.  You found a secret!!! Reload to return.';
})();