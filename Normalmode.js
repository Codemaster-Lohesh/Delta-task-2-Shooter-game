const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width=innerWidth
canvas.height=innerHeight

const gameOverScreen = document.querySelector('#gameoverPopup');
const endScore = document.querySelector('#score-display')

const scoreEle=document.querySelector('#score')
const healthEle=document.querySelector('#health')
let health=5
healthEle.innerHTML=health

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

const projectiles=[]

addEventListener('click',(event)=>{
    console.log(projectiles)
    const angle= Math.atan2(event.clientY-player.position.y,event.clientX-player.position.x)
    const velocity={
        x:Math.cos(angle)*5,
        y:Math.sin(angle)*5
    }
    projectiles.push(new Projectile(player.position.x,player.position.y,5,'white',velocity))
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
        cancelAnimationFrame(animationId)
        endScore.innerHTML=`Points:${score}`
        gameOverScreen.showModal()
    }
    
    enemies.forEach((enemy,enemyIndex) => {
        enemy.update()

        const distance1= Math.hypot(player.position.x-enemy.x,player.position.y-enemy.y)
        if (distance1 - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
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

}

function reload(){
    window.location.reload()
}

requestAnimationFrame(main)
spawnEnemies()