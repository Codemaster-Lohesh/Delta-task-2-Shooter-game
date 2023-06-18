const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width=innerWidth
canvas.height=innerHeight

const gameOverScreen = document.querySelector('#gameoverPopup');
gameOverScreen.close()
const endScore = document.querySelector('#score-display')

const scoreEle=document.querySelector('#score')
const healthEle=document.querySelector('#health')
const highscoreEle=document.querySelector('#highscore')
let HackerHighscore=localStorage.getItem("HackerHighscore");
highscoreEle.innerHTML=`${HackerHighscore}`

let health=5
healthEle.innerHTML=health

//sound
const playerShootAudio=new Audio('shoot.wav')
const enemyShootAudio=new Audio('enemyShoot.wav')
const gameOverAudio=new Audio('gameOver.mp3')

const homeSize = 100
const homeX=canvas.width/2-homeSize/2
const homeY=canvas.height-homeSize

class Player{
    constructor(){
        this.position={
            x:canvas.width/2,
            y:canvas.height/2
        }
        this.velocity = {
            x:0,
            y:0
        }
        this.radius=15
    }  
    /* drawNozzle(){

    } */  

    draw() {
        c.beginPath();
        c.fillStyle ="white"
        c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2)
        c.fill()
        c.closePath()
    }

    update(){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player= new Player()
const keys = {
    a:{
        pressed:false
    },
    d:{
        pressed:false
    },
    w:{
        pressed:false
    },
    s:{
        pressed:false
    },
}

let SPEED=5;
addEventListener('keydown',({key})=>{
    switch(key){
        case 'a':
            keys.a.pressed=true
            break
        case 'd':
            keys.d.pressed=true
            break
        case 'w':
            keys.w.pressed=true
            break
        case 's':
            keys.s.pressed=true
            break
    }
})

addEventListener('keyup',({key})=>{
    switch(key){
        case 'a':
            keys.a.pressed=false
            break
        case 'd':
            keys.d.pressed=false
            break
        case 'w':
            keys.w.pressed=false
            break
        case 's':
            keys.s.pressed=false
            break
    }
})

function updatePlayerSpeed(){
    if(keys.a.pressed){
        player.velocity.x = -SPEED
    }
    if(keys.d.pressed){
        player.velocity.x = SPEED
    }
    if(keys.w.pressed){
        player.velocity.y = -SPEED
    }
    if(keys.s.pressed){
        player.velocity.y = SPEED
    }
    if(!(player.position.x - player.radius>=0)){
        keys.a.pressed=false
        keys.w.pressed=false
        keys.s.pressed=false
    }
    if(!(player.position.x + player.radius <= canvas.width)){
        keys.d.pressed=false
        keys.w.pressed=false
        keys.s.pressed=false
    }
    if(!(player.position.y - player.radius>=0)){
        keys.w.pressed=false
        keys.a.pressed=false
        keys.d.pressed=false
    }
    if(!(player.position.y + player.radius <= canvas.height)){
        keys.s.pressed=false
        keys.a.pressed=false
        keys.d.pressed=false
    }
    if(!(keys.a.pressed || keys.d.pressed || keys.w.pressed || keys.s.pressed)){
        player.velocity.x =0
        player.velocity.y =0
    }
}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    
    draw(){
        c.beginPath()
        c.fillStyle=this.color
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fill()
        c.closePath()
    }
    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

let powerUp=false
const projectiles=[]
const enemyProjectiles=[]


addEventListener('click',function shoot(event){
    playerShootAudio.play()
    console.log(powerUp)
    const angle= Math.atan2(event.clientY-player.position.y,event.clientX-player.position.x)
    const velocity={
        x:Math.cos(angle)*5,
        y:Math.sin(angle)*5
    }
    if (powerUp){
        projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',{x:velocity.x,y:velocity.y}))
        projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',{x:-velocity.x,y:velocity.y}))
        projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',{x:velocity.x,y:-velocity.y}))
        projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',{x:-velocity.x,y:-velocity.y}))
    }
    else{
        projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',velocity))
    }
})

class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }
    
    draw(){
        c.beginPath()
        c.fillStyle=this.color
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fill()
        c.closePath()
    }
    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const enemies=[]
function spawnEnemies(){
    setInterval(()=>{
        const radius=30
        const x=Math.random() * canvas.width
        const y=-radius
        const color=`hsl(${Math.random() *360},50%,50%)`
        const angle= Math.atan2((homeY)-y,(homeX+homeSize/2)-x)
        const velocity={
            x:Math.cos(angle),
            y:Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000)
}

let lasttime=0;
let cancelAnimation=false

function enemyShoot(time){

    enemyProjectiles.forEach((enemyProjectile,enemyProjectileIndex)=>{
        enemyProjectile.update()
        if(
            enemyProjectile.x+enemyProjectile.radius<0 || 
            enemyProjectile.x-enemyProjectile.radius>canvas.width ||
            enemyProjectile.y+enemyProjectile.radius<0 ||
            enemyProjectile.y-enemyProjectile.radius>canvas.height 
            ){
            setTimeout(() => {
                enemyProjectiles.splice(enemyProjectileIndex,1)
            }, 0);
        }

        const distance= Math.hypot(player.position.x-enemyProjectile.x,player.position.y-enemyProjectile.y)
            if (distance - player.radius - enemyProjectile.radius < 1){
                enemyProjectiles.splice(enemyProjectileIndex,1)
                cancelAnimation=true
                gameOverScreen.showModal()
            }
    })

    enemies.forEach((enemy,enemyIndex) => {
        if ((time/1000)-lasttime >=1){
            lasttime=Math.floor(time/1000);
            
            const angle= Math.atan2(player.position.y-enemy.y,player.position.x-enemy.x)
            const velocity={
                x:Math.cos(angle)*2,
                y:Math.sin(angle)*2
            }
            enemyShootAudio.play()
            enemyProjectiles.push(new Projectile(enemy.x,enemy.y,5,'red',velocity))
        }
    })
}

class Powerup{
    constructor(x,y,size,color){
        this.x=x
        this.y=y
        this.size=size
        this.color=color
    }

    draw(){
        c.fillStyle=this.color
        c.fillRect(this.x,this.y,this.size,this.size)
    }
}

let powerups=[]

let lasttime2=0

function GetpowerUp(time){
    const size=30
    if ((time/1000)-lasttime2 >=10){
        lasttime2=Math.floor(time/1000);
        
        if (powerups.length == 0){
            powerups.push(new Powerup(Math.random()*canvas.width,Math.random()*canvas.height,size,'white'))
        }
    }
    
    powerups.forEach((powerup)=>{
        powerup.draw()
        const distance=Math.hypot(powerup.x+(size/2)-player.position.x,powerup.y+(size/2)-player.position.y)
        if (distance - (size/Math.sqrt(2)) - player.radius < 1){
            powerUp=true
            powerups.pop()
        }
    })

    if (powerUp){
        setTimeout(() => {
            powerUp=false
        }, 5000);
    }
}

let animationId
let score=0


function main(currentTime){
    c.fillStyle='yellow'
    c.fillRect(homeX,homeY,homeSize,homeSize)
    c.fillStyle='rgba(0,0,0,0.2)'
    c.fillRect(0,0,canvas.width,canvas.height)
    animationId=requestAnimationFrame(main)
    updatePlayerSpeed()
    player.draw()
    player.update()

    enemyShoot(currentTime)
    GetpowerUp(currentTime)

    projectiles.forEach((projectile,projectileIndex) => {
        projectile.update()
        if(
            projectile.x+projectile.radius<0 || 
            projectile.x-projectile.radius>canvas.width ||
            projectile.y+projectile.radius<0 ||
            projectile.y-projectile.radius>canvas.height 
            ){
            setTimeout(() => {
                projectiles.splice(projectileIndex,1)
            }, 0);
        }
    });
    if(health==0){
        cancelAnimation=true
        endScore.innerHTML=`Points:${score}`
        gameOverScreen.showModal()
        if (HackerHighscore<score){
            HackerHighscore=score;
            localStorage.setItem("HackerHighscore",HackerHighscore);
        }
    }

    if (cancelAnimation){
        gameOverAudio.play()
        cancelAnimationFrame(animationId)
    }
    
    enemies.forEach((enemy,enemyIndex) => {
        enemy.update()

        const distance1= Math.hypot(player.position.x-enemy.x,player.position.y-enemy.y)
        if (distance1 - enemy.radius - player.radius < 1){
            cancelAnimation=true
            endScore.innerHTML=`Points:${score}`
            gameOverScreen.showModal()
        }

        const distance2= Math.hypot((homeX+homeSize/2) - enemy.x , homeY-enemy.y)
        if(distance2 - enemy.radius< 1){
            enemies.splice(enemyIndex,1)
            health -=1
            healthEle.innerHTML= health
        }

        projectiles.forEach((projectile,projectileIndex) => {
            const distance= Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)
            if (distance - enemy.radius - projectile.radius < 1){
                score += 1
                scoreEle.innerHTML=score

                setTimeout(() => {
                    enemies.splice(enemyIndex,1)
                    projectiles.splice(projectileIndex,1)
                }, 0);   
            }
        })
    })

    if (HackerHighscore<score){
        HackerHighscore=score;
        localStorage.setItem("HackerHighscore",HackerHighscore);
        highscoreEle.innerHTML=`${HackerHighscore}`
    }
}

function reload(){
    window.location.reload()
}

requestAnimationFrame(main)
spawnEnemies()