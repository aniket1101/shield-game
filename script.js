const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreElement = document.querySelector('#scoreElement');
const startSinglePlayerBtn = document.querySelector('#startSinglePlayerBtn')
const startMultiplayerBtn = document.querySelector('#startMultiplayerBtn')
const restartSinglePlayerBtn = document.querySelector('#restartSinglePlayerBtn')
const gameOverHomeBtn = document.querySelector('#gameOverHomeBtn')
const startGameModalElement = document.querySelector('#startGameModalElement')
const gameOverModalElement = document.querySelector('#gameOverModalElement')
const scoreNumberElement = document.querySelector('#scoreNumberElement')
const scoreTextElement = document.querySelector('#scoreTextElement')

gameOverModalElement.style.display = 'none'

// Game Agent Classes--------------------
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true)
        ctx.fillStyle = this.color;
        ctx.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true)
        ctx.fillStyle = this.color;
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true)
        ctx.fillStyle = this.color;
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const fric = 0.98

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true)
        ctx.fillStyle = this.color;
        ctx.fill()
        ctx.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= fric
        this.velocity.y *= fric
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}

// Game Agents------------------
const x = canvas.width/2;
const y = canvas.height/2;

let player = new Player(x, y, 15, 'white')
let projectiles = [];
let enemies = [];
let particles = [];

// On-Screen Functions-------------------------

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 8) + 8;


        let x
        let y

        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)}

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
    clearInterval(spawnEnemies, 1000)
}

let animationID
let score = 0

function animate() {
    animationID = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
        particle.update()
        }
    })
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()

        // Remove projectiles that go off-screen
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
                }, 0)
        }
    })
    
    enemies.forEach((enemy, index) => {
        enemy.update()
        
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if(distance - player.radius - enemy.radius < 1) {
            // GAME OVER
            ctx.fillStyle = 'rgba(255, 34, 25, 0.9)'
            cancelAnimationFrame(animationID)
            scoreNumberElement.innerHTML = score
            gameOverModalElement.style.display = 'flex'
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            // Projectile collides with enemy
        if (distance - enemy.radius - projectile.radius < 1) {

            // Fireworks
            for (let i = 0; i < enemy.radius * 2; i++) {
                particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}))
                
            }
            if (enemy.radius > 18) {

            // Increase score
            score += 10;
            scoreElement.innerHTML = score

                gsap.to(enemy, {
                    radius: enemy.radius - 10
                })
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1)
                    }, 0)
            } else {
                score += 25;
                scoreElement.innerHTML = score

                setTimeout(() => {
                enemies.splice(index, 1)
                projectiles.splice(projectileIndex, 1)
                }, 0)
            }
        }
        })
    })
}

function initialise() {
    player = new Player(x, y, 15, 'white')
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerHTML = score
    scoreNumberElement.innerHTML = score
    document.body.style.background = 'black'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    animationID = null 
    // scoreElement.visibility = 'visible'
    // scoreTextElement.visibility = 'visible'
}

spawnEnemies()


// EVENT LISTENERS-----------------------
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2);

    // Alter projectile speed here
    const velocity = {x: Math.cos(angle)*6, y: Math.sin(angle)*6}
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white', velocity))
});

startSinglePlayerBtn.addEventListener('click', () => {
    initialise()
    animate()
    startGameModalElement.style.display = 'none'
})

gameOverHomeBtn.addEventListener('click', () => {
    initialise()
    gameOverModalElement.style.display = 'none'
    startGameModalElement.style.display = 'flex'
})

restartSinglePlayerBtn.addEventListener('click', () => {
    initialise()
    animate()
    gameOverModalElement.style.display = 'none'
})
