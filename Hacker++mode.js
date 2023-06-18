const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width=innerWidth
canvas.height=innerHeight

const gameOverScreen = document.querySelector('#gameoverPopup');
gameOverScreen.close()
const endScore = document.querySelector('#score-display')

const scoreEle=document.querySelector('#score')
let score=0
const healthEle=document.querySelector('#health')
const highscoreEle=document.querySelector('#highscore')
let HackerplusHighScore=localStorage.getItem("HackerplusHighScore");
highscoreEle.innerHTML=`${HackerplusHighScore}`

let health=5
healthEle.innerHTML=health

//sound
const playerShootAudio=new Audio('shoot.wav')
const enemyShootAudio=new Audio('enemyShoot.wav')
const gameOverAudio=new Audio('gameOver.mp3')
const enemyBossAudio=new Audio('bomb.mp3')

const homeSize = 100
const homeX=canvas.width/2-homeSize/2
const homeY=canvas.height/2-homeSize/2

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
        const rand=Math.random()
        let x,y;
        if (rand<0.25){
            x=canvas.width*Math.random()
            y=-radius
        }
        else if(rand>=0.25 && rand<0.5){
            x=-radius
            y=canvas.height*Math.random()
        }
        else if(rand>=0.5 && rand<0.75){
            x=canvas.width*Math.random()
            y=canvas.height+radius
        }
        else{
            x=canvas.width+radius
            y=canvas.height*Math.random()
        }
        const color=`hsl(${Math.random() *360},50%,50%)`
        const angle= Math.atan2((homeY+homeSize/2)-y,(homeX+homeSize/2)-x)
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
                
            }
    })

    enemies.forEach((enemy,enemyIndex) => {
        if ((time/1000)-lasttime >=2){
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

const powerups=[]

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

const homeProjectiles=[]
let lasttime3=0
function homeShoot(time){
    /* console.log(homeProjectiles) */
    homeProjectiles.forEach((homeProjectile,homeProjectileIndex)=>{

        if(
            homeProjectile.x+homeProjectile.radius<0 || 
            homeProjectile.x-homeProjectile.radius>canvas.width ||
            homeProjectile.y+homeProjectile.radius<0 ||
            homeProjectile.y-homeProjectile.radius>canvas.height 
            ){
            setTimeout(() => {
                homeProjectiles.splice(homeProjectileIndex,1)
            }, 0);
        }
    })

    enemies.forEach((enemy,enemyIndex) => {

        const dist=Math.hypot((canvas.width/2)-enemy.x,(canvas.height/2)-enemy.y)
        
        if (dist<200){
    
            const angle= Math.atan2(enemy.y-canvas.height/2,enemy.x-canvas.width/2)
            const velocity={
                x:Math.cos(angle),
                y:Math.sin(angle)
            }
           
            if ((time/1000)-lasttime3 >=3){
                lasttime3=Math.floor(time/1000);
                playerShootAudio.play()
                homeProjectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity))
            }
        }
        homeProjectiles.forEach((homeProjectile,homeProjectileIndex)=>{
            
            homeProjectile.update()

            const distance= Math.hypot(enemy.x-homeProjectile.x,enemy.y-homeProjectile.y)

            if (distance - enemy.radius - homeProjectile.radius < 1){
                homeProjectiles.splice(homeProjectileIndex,1)
                enemies.splice(enemyIndex,1)
            }
        }) 
    })
}

class Boss{
    constructor(x,y,radius,color,velocity,bossHealth){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.bossHealth=bossHealth
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

const bosses=[]
function spawnBosses(){
    setInterval(()=>{
        const radius=60
        const bossHealth=3
        const rand=Math.random()
        let x,y;
        if (rand<0.25){
            x=canvas.width*Math.random()
            y=-radius
        }
        else if(rand>=0.25 && rand<0.5){
            x=-radius
            y=canvas.height*Math.random()
        }
        else if(rand>=0.5 && rand<0.75){
            x=canvas.width*Math.random()
            y=canvas.height+radius
        }
        else{
            x=canvas.width+radius
            y=canvas.height*Math.random()
        }
        const color=`hsl(${Math.random()*360},50%,50%)`
        const angle= Math.atan2((homeY+homeSize/2)-y,(homeX+homeSize/2)-x)
        const velocity={
            x:Math.cos(angle)*0.5,
            y:Math.sin(angle)*0.5
        }
        bosses.push(new Boss(x,y,radius,color,velocity,bossHealth))
    },10000)
}

function bossFunctionality(){
    bosses.forEach((boss,bossIndex) => {
        boss.update()
        const distance1= Math.hypot(player.position.x-boss.x,player.position.y-boss.y)
        if (distance1 - boss.radius - player.radius < 1){
            cancelAnimation=true
            endScore.innerHTML=`Points:${score}`
        }

        const distance2= Math.hypot((homeX+homeSize/2) - boss.x ,(homeY+homeSize/2) - boss.y)
        if(distance2 - boss.radius - homeSize/Math.sqrt(2)< 1){
            setTimeout(() => {
                bosses.splice(bossIndex,1)
            }, 0);
            
            health -=3
            healthEle.innerHTML= health
        }

        projectiles.forEach((projectile,projectileIndex) => {
            const distance= Math.hypot(projectile.x-boss.x,projectile.y-boss.y)
            if (distance - boss.radius - projectile.radius < 1){
                score += 3
                scoreEle.innerHTML=score
                boss.bossHealth -= 1
                setTimeout(() => {
                    projectiles.splice(projectileIndex,1)
                }, 0);
                if (boss.bossHealth==0){
                    setTimeout(() => {
                        bosses.splice(bossIndex,1)
                    }, 0);
                }   
            }
        })
    })
}

const homingProjectiles=[]
class HomingProjectile{
    constructor(x,y,radius,color,velocity,target){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.target=target
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
        const angle= Math.atan2(this.target.y-this.y,this.target.x-this.x)
        this.velocity={
            x:Math.cos(angle)*2,
            y:Math.sin(angle)*2
        }
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

let lasttime4=0
function homingProjectile(time){
    bosses.forEach((boss,bossIndex) => {
        const angle= Math.atan2(boss.y-player.position.y,boss.x-player.position.x)
        const velocity={
            x:Math.cos(angle)*2,
            y:Math.sin(angle)*2
        }
        
        if ((time/1000)-lasttime4 >=3){
            lasttime4=Math.floor(time/1000);
            enemyBossAudio.play()
            homingProjectiles.push(new HomingProjectile(boss.x,boss.y,10,'orange',velocity,player.position))
        } 
    })

    homingProjectiles.forEach((homingProjectile,homingProjectileIndex)=>{
            
        homingProjectile.update()

        const distance= Math.hypot(homingProjectile.x-player.position.x,homingProjectile.y-player.position.y)
        
        if (distance - player.radius - homingProjectile.radius < 1){
            cancelAnimation=true   
        }

        projectiles.forEach((projectile,projectileIndex)=>{
            const dist= Math.hypot(homingProjectile.x-projectile.x,homingProjectile.y-projectile.y)

            if (dist - homingProjectile.radius - projectile.radius < 1){
                setTimeout(() => {
                    homingProjectiles.splice(homingProjectileIndex,1)
                    projectiles.splice(projectileIndex,1)
                }, 0);
            }
        
        })
    })
}



let animationId

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
    homeShoot(currentTime)
    bossFunctionality()
    homingProjectile(currentTime)

    bosses.forEach((boss)=>{
        boss.update()
    })

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
    if(health<=0){
        cancelAnimation=true
        endScore.innerHTML=`Points:${score}`
        if (HackerplusHighScore<score){
            HackerplusHighScore=score;
            localStorage.setItem("HackerplusHighScore",HackerplusHighScore);
        }
    }

    if (cancelAnimation){
        gameOverAudio.play()
        cancelAnimationFrame(animationId)
        gameOverScreen.showModal()
    }
    
    enemies.forEach((enemy,enemyIndex) => {
        enemy.update()

        const distance1= Math.hypot(player.position.x-enemy.x,player.position.y-enemy.y)
        if (distance1 - enemy.radius - player.radius < 1){
            cancelAnimation=true
            endScore.innerHTML=`Points:${score}`
        }

        const distance2= Math.hypot((homeX+homeSize/2) - enemy.x ,(homeY+homeSize/2) - enemy.y)
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

    if (HackerplusHighScore<score){
        HackerplusHighScore=score;
        localStorage.setItem("HackerplusHighScore",HackerplusHighScore);
        highscoreEle.innerHTML=`${HackerplusHighScore}`
    }
}

function reload(){
    window.location.reload()
}

requestAnimationFrame(main)
spawnEnemies()
spawnBosses()