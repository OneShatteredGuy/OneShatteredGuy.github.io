// Create and append canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Fullscreen canvas and responsive resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Optional: keep canvas behind all content
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none'; // allows clicks through canvas

class Screen {
    constructor(simFunction, startY = 0, objects = []) {
        this.sim = simFunction;
        this.y = startY;
        this.targetY = startY;
        this.active = true;
        this.objects = objects;
    }

    update(delta) {
        if (!this.active) return;
        this.sim(delta, this.objects);
        
        const speed = 1500; // pixels per second
        if (this.y !== this.targetY) {
            const dir = Math.sign(this.targetY - this.y);
            this.y += dir * speed * delta;
            // clamp overshoot
            if ((dir > 0 && this.y > this.targetY) || (dir < 0 && this.y < this.targetY)) {
                this.y = this.targetY;
            }
        }
    }
    
    isInBounds(positionX, positionY, margin) {
        const bounds = this.getBounds();
        return (positionX >= margin + bounds.left && positionX <= bounds.right - margin && positionY >= bounds.top + margin && positionY <= bounds.bottom - margin);
    }
    
    getBounds() {
        return {
            top: this.y,
            right: canvas.width,
            bottom: this.y + canvas.height,
            left: 0
        };
    }
    
    toggleActive() {
        this.active = !this.active;
    }
    
    changeSim(sim) {
        this.objects = [];
        this.sim = sim;
    }
}


class bubble {
    constructor(posX, posY, velX, velY, radius, lifetime, lightColor, darkColor, screen, isLightColor = false) {
        this.xPos = posX;
        this.yPos = posY;
        this.xVel = velX;
        this.yVel = velY;
        this.radius = 0;
        this.lifeTime = 0;
        this.maxLife = lifetime;
        this.desiredRadius = radius;
        this.lightColor = lightColor;
        this.darkColor = darkColor;
        this.isLightColor = isLightColor;
        this.screen = screen;
        this.color = isLightColor ? lightColor : darkColor;
    }
    
    draw() {
        const isLightMode = document.body.classList.contains('light-mode');
        this.color = isLightMode ? this.lightColor : 'white';
        let blurColor = isLightMode ? this.lightColor : this.darkColor;
        
        drawCircle(this.xPos, this.yPos + this.screen.y, this.radius, this.color, blurColor);
    }
    
    checkCollisions(bubbles) {
        
        if (this.xPos - this.radius < 0 || this.xPos + this.radius > canvas.width) {
            this.xPos = Math.max(this.radius, Math.min(this.xPos, canvas.width - this.radius));
            this.xVel *= -1;
        }
        if (this.yPos - this.radius < 0 || this.yPos + this.radius > canvas.height) {
            this.yPos = Math.max(this.radius, Math.min(this.yPos, canvas.height - this.radius));
            this.yVel *= -1;
        }
        
        bubbles.forEach(bubble => {
            if (this === bubble) return;
            
            const dx = bubble.xPos - this.xPos;
            const dy = bubble.yPos - this.yPos;
            const dist = Math.hypot(dx, dy); // same as Math.sqrt(dx*dx + dy*dy)
            const overlap = this.radius + bubble.radius - dist;
            
            if (overlap > 0) {
                const nx = dx / Math.max(dist, 0.1);
                const ny = dy / Math.max(dist, 0.1);
                this.xPos -= nx * (overlap + 1) / 2;
                this.yPos -= ny * (overlap + 1) / 2;
                bubble.xPos += nx * (overlap + 1) / 2;
                bubble.yPos += ny * (overlap + 1) / 2;
            }
        });
        
    }
    
    checkLifetime() {
        if (this.lifeTime <= this.maxLife) {
            return this;
        }
        
        let bubbleSize = Math.round(Math.random() * 75 + 25);
        let bubbleStartVelX = bubbleSpeedModifier * (Math.random() * 6 - 3);
        let bubbleStartVelY = bubbleSpeedModifier * (Math.random() * 6 - 3);
        let bubbleStartX = bubbleSize + Math.random() * (canvas.width - bubbleSize * 2);
        let bubbleStartY = bubbleSize + Math.random() * (canvas.height - bubbleSize * 2);
        let bubbleDarkColor = bubbleDarkColors[Math.floor(Math.random() * bubbleDarkColors.length)];
        let bubbleLightColor = bubbleLightColors[Math.floor(Math.random() * bubbleLightColors.length)];
        let bubbleMaxLife = Math.random() * 110 + 30;
        
        return new bubble(bubbleStartX, bubbleStartY, bubbleStartVelX, bubbleStartVelY, bubbleSize, bubbleMaxLife, bubbleLightColor, bubbleDarkColor, this.screen);
    }
    
    update(bubbles, delta) {
        this.lifeTime += delta;
        
        this.radius = easeOutLerp(this.radius, this.desiredRadius, delta, 2) * timeDecay(this.lifeTime, this.maxLife, 10);
        
        this.xPos += this.xVel * delta;
        this.yPos += this.yVel * delta;
        
        this.checkCollisions(bubbles);
        
        this.draw();
    }
}

class node {
    constructor(posX, posY, velX, velY, lifetime, lightColor, darkColor, screen, isLightColor = false) {
        this.xPos = posX;
        this.yPos = posY;
        
        this.xVel = velX;
        this.yVel = velY;
        
        this.radius = 0;
        this.desiredRadius = 0;
        
        this.lifeTime = 0;
        this.maxLife = lifetime;
        
        this.lightColor = lightColor;
        this.darkColor = darkColor;
        this.isLightColor = isLightColor;
        this.color = isLightColor ? lightColor : darkColor;
        
        this.screen = screen;
    }
    
    draw(allConnections, Cconnections, Nconnections, Econnections, Sconnections, Wconnections) {
        const isLightMode = document.body.classList.contains('light-mode');
        this.color = isLightMode ? this.lightColor : 'white';
        let blurColor = isLightMode ? this.lightColor : this.darkColor;
        
        //drawing other screens
        [-1, 1].forEach(x => {
            drawNeonDot(this.xPos + canvas.width * x, this.yPos + this.screen.y, allConnections * 1.5, this.color, blurColor);
                
            drawCircle(this.xPos + canvas.width * x, this.yPos + this.screen.y, this.radius, makeTransparent(this.color), blurColor, 4);            
        });
        [-1, 1].forEach(y => {
            drawNeonDot(this.xPos, this.yPos + this.screen.y + canvas.height * y, allConnections * 1.5, this.color, blurColor);
                
            drawCircle(this.xPos, this.yPos + this.screen.y + canvas.height * y, this.radius, makeTransparent(this.color), blurColor, 4);
        });
        
        
        drawCircle(this.xPos, this.yPos + this.screen.y, this.radius, makeTransparent(this.color), blurColor, 4);
        
        
        Cconnections.forEach(connection => {
            const dist = Math.hypot(connection.xPos - this.xPos, connection.yPos - this.yPos);
            drawNeonLine(this.xPos, this.yPos + this.screen.y, connection.xPos, connection.yPos + this.screen.y, this.color, blurColor, sigmoid(dist));
        });
        Nconnections.forEach(connection => {
            const dist = Math.hypot(connection.xPos - this.xPos, connection.yPos - this.yPos - canvas.height);
            drawNeonLine(this.xPos, this.yPos + this.screen.y, connection.xPos, connection.yPos + this.screen.y - canvas.height, this.color, blurColor, sigmoid(dist));
        });
        Sconnections.forEach(connection => {
            const dist = Math.hypot(connection.xPos - this.xPos, connection.yPos - this.yPos + canvas.height);
            drawNeonLine(this.xPos, this.yPos + this.screen.y, connection.xPos, connection.yPos + this.screen.y + canvas.height, this.color, blurColor, sigmoid(dist));
        });
        Econnections.forEach(connection => {
            const dist = Math.hypot(connection.xPos - this.xPos + canvas.width, connection.yPos - this.yPos);
            drawNeonLine(this.xPos, this.yPos + this.screen.y, connection.xPos + canvas.width, connection.yPos + this.screen.y, this.color, blurColor, sigmoid(dist));
        });
        Wconnections.forEach(connection => {
            const dist = Math.hypot(connection.xPos - this.xPos - canvas.width, connection.yPos - this.yPos);
            drawNeonLine(this.xPos, this.yPos + this.screen.y, connection.xPos - canvas.width, connection.yPos + this.screen.y, this.color, blurColor, sigmoid(dist));
        });
        
        drawNeonDot(this.xPos, this.yPos + this.screen.y, allConnections * 1.5, this.color, blurColor);
        
    }
    
    checkLifetime() {
        if (this.lifeTime <= this.maxLife) {
            return this;
        }
        
        let nodeStartVelX = 10 * (Math.random() * 6 - 3);
        let nodeStartVelY = 10 * (Math.random() * 6 - 3);
        let nodeStartX = Math.random() * canvas.width;
        let nodeStartY = Math.random() * canvas.height;
        let nodeMaxLife = Math.random() * 110 + 30;
        
        return new node(nodeStartX, nodeStartY, nodeStartVelX, nodeStartVelY, nodeMaxLife, this.lightColor, this.darkColor, this.screen);
    }
    
    update(nodes, delta) {
        this.lifeTime += delta;
        
        
        
        this.xPos += this.xVel * delta;
        this.yPos += this.yVel * delta;
        
        if (this.xPos > canvas.width) this.xPos -= canvas.width;
        if (this.xPos < 0) this.xPos += canvas.width;
        if (this.yPos > canvas.height) this.yPos -= canvas.height;
        if (this.yPos < 0) this.yPos -= canvas.height;
        
        const connectDist = 300;
        const Cconnections = nodes.filter(node => {
                const dx = node.xPos - this.xPos;
                const dy = node.yPos - this.yPos;
                const distance = Math.hypot(dx, dy);
                return distance <= connectDist;
        });
        const Nconnections = nodes.filter(node => {
                const dx = node.xPos - this.xPos;
                const dy = node.yPos - this.yPos - canvas.height;
                const distance = Math.hypot(dx, dy);
                return distance <= connectDist;
        });
        const Sconnections = nodes.filter(node => {
                const dx = node.xPos - this.xPos;
                const dy = node.yPos - this.yPos + canvas.height;
                const distance = Math.hypot(dx, dy);
                return distance <= connectDist;
        });
        const Econnections = nodes.filter(node => {
                const dx = node.xPos - this.xPos + canvas.width;
                const dy = node.yPos - this.yPos;
                const distance = Math.hypot(dx, dy);
                return distance <= connectDist;
        });
        const Wconnections = nodes.filter(node => {
                const dx = node.xPos - this.xPos - canvas.width;
                const dy = node.yPos - this.yPos;
                const distance = Math.hypot(dx, dy);
                return distance <= connectDist;
        });
        const allConnections = Cconnections.length + Nconnections.length + Econnections.length + Sconnections.length + Wconnections.length;
        
        this.desiredRadius = Math.max(10, allConnections * 25);
        this.radius = easeOutLerp(this.radius, this.desiredRadius, delta, 2) * timeDecay(this.lifeTime, this.maxLife, 10);
        
        this.draw(allConnections, Cconnections, Nconnections, Econnections, Sconnections, Wconnections);
    }
}


//helper functions ==============================================================
function timeDecay(x, zeroPoint = 1, decaySpeed = 1) {
    return Math.max(0, 1 - Math.exp(decaySpeed * (x-zeroPoint)));
}

function drawCircle(x, y, radius, color, blurColor, weight = 4) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = weight;

    // glow
    ctx.shadowColor = blurColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawNeonLine(x1, y1, x2, y2, color, blurColor, lineWidth = 4) {
    ctx.save();
    
    ctx.strokeStyle = color;      // line color
    ctx.lineWidth = lineWidth;    // line thickness
    
    ctx.shadowColor = blurColor;      // glow color
    ctx.shadowBlur = 10;        // amount of glow
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.restore();
}

function drawNeonDot(x, y, radius, color, glowColor) {
    ctx.save();

    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;  // glow color matches dot
    ctx.shadowBlur = 10;    // how strong the glow is
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function makeTransparent(color, alpha = 0.1) {
    // Create a temporary element
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);

    // Get computed color in rgb(r,g,b) form
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // Extract numbers
    const match = computed.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
    if (!match) return color; // fallback if parse fails

    const r = match[1], g = match[2], b = match[3];
    return `rgba(${r},${g},${b},${alpha})`;
}

function easeOutLerp(current, target, delta, speed = 1) {
    return current + (target - current) * speed * delta;
}

function sigmoid(x) {
    return (8 / (1 + Math.exp(0.02 * (x - 100))));
}

let isChangingSim = false;
let queue = 0;
window.changeSim = function(specifiedSim = -1) {
    if (isChangingSim) {
        queue = Math.min(3, queue + 1);
    }
    
    queue = Math.max(0, queue - 1);
    
    screen1.active = true;
    screen2.active = true;
    
    screen1.targetY += canvas.height;
    screen2.targetY += canvas.height;
    
    isChangingSim = true;
};
//=================================================================================

//bubbles==========================================================================
let bubbleQuantity = Math.round(Math.random() * 10 + 10);

let bubbleDarkColors = ['#00FFFF','#FF00FF','#39FF14','#FF073A','#FFEA00','#00FF6A','#7F00FF','#00B3FF'];
let bubbleLightColors = ['#008B8B','#8B008B','#006400','#8B0000','#B8860B','#0047AB','#2E0854','#005F6A'];

let bubbleSpeedModifier = Math.round(Math.random() * 40 + 10);

function initBubbles(screen) {
    for (let i = 0; i < bubbleQuantity; i++) {
        let bubbleSize = Math.round(Math.random() * 75 + 25);
        let bubbleStartVelX = bubbleSpeedModifier * (Math.random() * 6 - 3);
        let bubbleStartVelY = bubbleSpeedModifier * (Math.random() * 6 - 3);
        let bubbleStartX = bubbleSize + Math.random() * (canvas.width - bubbleSize * 2);
        let bubbleStartY = bubbleSize + Math.random() * (canvas.height - bubbleSize * 2);
        let bubbleDarkColor = bubbleDarkColors[Math.floor(Math.random() * bubbleDarkColors.length)];
        let bubbleLightColor = bubbleLightColors[Math.floor(Math.random() * bubbleLightColors.length)];
        let bubbleMaxLife = Math.random() * 110 + 10;
        
        screen.objects.push(new bubble(bubbleStartX, bubbleStartY, bubbleStartVelX, bubbleStartVelY, bubbleSize, bubbleMaxLife, bubbleLightColor, bubbleDarkColor, screen));
    }
}

function animateBubbles(delta, objects) {
    for (let i = 0; i < objects.length; i++) {
        let currBub = objects[i];
        
        currBub.update(objects.slice(i, objects.length), delta);
        
        currBub = currBub.checkLifetime();
        
        objects[i] = currBub;
    }
}
//==================================================================================

//network===========================================================================
let nodeQuantity = Math.round(Math.random() * 10 + 10);

let nodeDarkColors = ['#00FFFF','#FF00FF','#39FF14','#FF073A','#FFEA00','#00FF6A','#7F00FF','#00B3FF'];
let nodeLightColors = ['#008B8B','#8B008B','#006400','#8B0000','#B8860B','#0047AB','#2E0854','#005F6A'];
let chosenDarkColor = 0;
let chosenLightColor = 0;

function initNetwork(screen) {
    chosenDarkColor = Math.round(Math.random() * (nodeDarkColors.length - 1));
    chosenLightColor = Math.round(Math.random() * (nodeLightColors.length - 1));
    
    for (let i = 0; i < nodeQuantity; i++) {
        let nodeStartVelX = 10 * (Math.random() * 6 - 3);
        let nodeStartVelY = 10 * (Math.random() * 6 - 3);
        let nodeStartX = Math.random() * canvas.width;
        let nodeStartY = Math.random() * canvas.height;
        let nodeMaxLife = Math.random() * 110 + 30;
        
        screen.objects.push(new node(nodeStartX, nodeStartY, nodeStartVelX, nodeStartVelY, nodeMaxLife, nodeDarkColors[chosenLightColor], nodeLightColors[chosenDarkColor], screen));
    }
}

function animateNetwork(delta, objects) {
    for (let i = 0; i < objects.length; i++) {
        let currNode = objects[i];
        
        currNode.update(objects.slice(i, objects.length), delta);
        
        currNode = currNode.checkLifetime();
        
        objects[i] = currNode;
    }
}

//==================================================================================

let screen1 = new Screen(animateBubbles);
initBubbles(screen1);

const possibleSims = ['bubble', 'node'];
let currentSim = screen1;


let screen2 = new Screen(animateBubbles, -canvas.height);
screen2.toggleActive();
switch (possibleSims[Math.floor(Math.random() * possibleSims.length)]) {
    case 'bubble':
        screen2.changeSim(animateBubbles);
        initBubbles(screen2);
        break;
    case 'node':
        screen2.changeSim(animateNetwork);
        initNetwork(screen2);
        break;
}

changeSim();


let lastTime = 0;
function animate(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    screen1.update(delta);
    screen2.update(delta);
    
    if (screen1.y >= canvas.height) {
        
        screen1.y = -canvas.height;
        screen1.targetY = -canvas.height;
        screen1.toggleActive();
        
        const chosenSim = possibleSims[Math.floor(Math.random() * possibleSims.length)];
        switch (chosenSim) {
            case 'bubble':
                screen1.changeSim(animateBubbles);
                initBubbles(screen1);
                break;
            case 'node':
                screen1.changeSim(animateNetwork);
                initNetwork(screen1);
                break;
        }
        
        isChangingSim = false;
        if (queue > 0) changeSim();
    }
    if (screen2.y >= canvas.height) {
        
        screen2.y = -canvas.height;
        screen2.targetY = -canvas.height;
        screen2.toggleActive();
        
        const chosenSim = possibleSims[Math.floor(Math.random() * possibleSims.length)];
        switch (chosenSim) {
            case 'bubble':
                screen2.changeSim(animateBubbles);
                initBubbles(screen2);
                break;
            case 'node':
                screen2.changeSim(animateNetwork);
                initNetwork(screen2);
                break;
        }
        
        isChangingSim = false;
        if (queue > 0) changeSim();
    }
    
    if (screen1.y === screen2.y) {
        screen1.y += canvas.height;
        screen1.targetY += canvas.height;
    }
    
    // Request next frame
    requestAnimationFrame(animate);
}

animate(0);





















