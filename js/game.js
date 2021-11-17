document.addEventListener('DOMContentLoaded',() => {
    const StartBtn = document.querySelector('#start-button')
    const Submit = document.getElementById('setting')
    const GameShow = document.getElementsByClassName('game')


    // TODO: we can also get the grid size from user
    let GRID_WIDTH = 30   
    let GRID_HEIGHT = 20
    let GRID_SIZE 


    let grid = null
    let squares = null

    //work reference
    let timerId
    let enemiesInterval
    let energy = 100
    let enemiesPosizion=[]
    let currentPosition = 0
    let coinAudio= new Audio("audio/coin.mp3");
    let bombAudio =new Audio("audio/bomb.mp3")

    //ambient reference
    let speed
    let coin
    let wall
    let bomb
    let collect = 0


    Submit.addEventListener('submit',()=>{
        console.log(document.getElementById("dim").value)
        console.log(document.getElementById("dif").value)

        GameShow[0].style.visibility = 'visible'
        switch (document.getElementById("dim").value) {
                case "Small":
                    GRID_HEIGHT = 20
                    GRID_WIDTH = 20
                    wall = 10
                    break;
                case "Medium":
                    wall = 20
                    break;
                case "Large":
                    GRID_WIDTH = 30   
                    GRID_HEIGHT = 20
                    wall = 30
                    break;
        }

        switch (document.getElementById("dif").value) {
                case "Easy":
                    speed = 300
                    coin = 5
                    bomb =4
                    break;
                case "Normal":
                    speed = 150
                    coin = 10
                    bomb =8
                    break;
                case "Hard":
                    speed = 50
                    coin = 15
                    bomb = 12
                    break;
        }

        GRID_SIZE = GRID_WIDTH * GRID_HEIGHT
        gameRender()
        energyUpdate()
        Submit.remove()
    })


    function gameRender(){
        grid = createGrid()
        squares = Array.from(grid.querySelectorAll('div'))
        generateObj(coin,"coin")
        generateObj(wall,"wall")
        generateObj(bomb,"bomb")
        generateEnemies(3)
        document.addEventListener('keydown', control)
    }


    function createGrid() {
        // the main grid
        let grid = document.querySelector(".grid")
        for (let i = 0; i < GRID_SIZE; i++) {
            let gridElement = document.createElement("div")
            grid.appendChild(gridElement)
        }

        // set base of grid
        for (let i = 0; i < GRID_WIDTH; i++) {
          let gridElement = document.createElement("div")
          gridElement.setAttribute("class", "block3")
          grid.appendChild(gridElement)
        }

        //.this need to change dimension realtime
        let width = GRID_WIDTH *3
        //console.log("width: "+ width)
        grid.style.width = width + "rem"
        let height = GRID_HEIGHT * 3
        //console.log("height: "+ height)
        grid.style.height =  height + "rem"

        return grid;
    } 
    function draw(){
        squares[currentPosition].classList.add('player')
    }

    function undraw(){
        squares[currentPosition].classList.remove('player')
    }

    function generateObj(numberObj , type){

        for(let i = 0 ; i < numberObj;i++){
        let r = Math.floor(Math.random() * GRID_SIZE)
        squares[r].classList.add(type)
        }
    }

    function energyUpdate(){
        document.getElementById("energy").innerHTML = "<h1>"+energy+"</h1>";
    }

    function collectUpdate(){
        document.getElementById("collect").innerHTML = "<h1>"+collect+"</h1>";
    }


    //assign functions to keycodes
    function control(e) {
        if (e.keyCode === 39)
            moveright()
        else if (e.keyCode === 38)
            moveUp()
        else if (e.keyCode === 37)
            moveleft()
        else if (e.keyCode === 40)
            moveDown()
    }

    //console.log(squares)

    /*
        SECTION MOVE CONTROL
    */

     //move down function 
     function moveDown(){
        undraw()
        const isAtButtom = (currentPosition+GRID_WIDTH) > GRID_SIZE
        let tmp = currentPosition
        if(isAtButtom)
        currentPosition = (currentPosition+GRID_WIDTH)-GRID_SIZE
        else
        currentPosition += GRID_WIDTH

        clearInterval(timerId)
        timerId = setInterval(moveDown,speed)
        actionPlayer(tmp)

        draw()
    }

    function moveleft(){
        undraw()
        const isAtLeft = currentPosition%GRID_WIDTH == 0
        let tmp = currentPosition

        if (isAtLeft)
        currentPosition = currentPosition+GRID_WIDTH-1
        else
        currentPosition = currentPosition - 1

        clearInterval(timerId)
        timerId = setInterval(moveleft,speed)
        actionPlayer(tmp)
        draw()
    }

    function moveright(){
        undraw()
        const isAtRight = currentPosition%GRID_WIDTH == GRID_WIDTH -1
        let tmp = currentPosition
        if(isAtRight)
        currentPosition = currentPosition-GRID_WIDTH+1
        else
        currentPosition = currentPosition +1

        clearInterval(timerId)
        timerId = setInterval(moveright,speed)
        actionPlayer(tmp)
        draw()
    }

    function moveUp(){
        undraw()
        const isOnTop=(currentPosition-GRID_WIDTH) < 0
        let tmp=currentPosition
        if(isOnTop)
        currentPosition = GRID_SIZE - GRID_WIDTH + currentPosition
        else
        currentPosition -= GRID_WIDTH
        clearInterval(timerId)
        timerId = setInterval(moveUp,speed)
        actionPlayer(tmp)
        draw()
    }



    /*
    
    Player Control posizion 
    */

    function squarescontain(name){
        return squares[currentPosition].classList.contains(name)
    }

    function actionPlayer(tmp){
        switch (true) {
            case squarescontain("wall"):
                currentPosition = tmp
                break;
            case squarescontain("coin"):
                coin -= 1
                if(coin<= 0){
                    gamewin()
                }
                else{
                    collect += 1
                    coinAudio.play()
                    collectUpdate()
                }
                
                squares[currentPosition].classList.remove('coin')
                break
            case squarescontain("bomb"):
                energy -= 25 
                if (energy <= 0){
                    gameOver()
                }
                energyUpdate()
                bombAudio.play()
                squares[currentPosition].classList.remove('bomb')
                break
            case squarescontain("enemies"):
                gameOver()
                break
        }
    }





    /*
    
    ENEMIES SECTION 
    
    */
    function generateEnemies(number){
        for(let i = 0 ; i < number;i++){
        let r = Math.floor(Math.random() * GRID_SIZE)
        enemiesPosizion.push(r)
        squares[r].classList.add("enemies")
        }
    }
  
    function drawEnemies(){
        enemiesPosizion.forEach((position ,index )=> {
            squares[position].classList.remove('enemies')

            let playerp = Math.floor(currentPosition / GRID_WIDTH) + 1
            let enemiesp = Math.floor(position / GRID_WIDTH) + 1
            
            if(playerp < enemiesp){ 
                position = moveUpEnemie(position)
            }
            else if (playerp == enemiesp){
                if(currentPosition < position){
                    position = moveLeftEnemie(position)
                }
                else{
                    position = moveRightEnemie(position)
                    
                }
            }
            else{
                position = moveDownEnemie(position)

            }
            squares[position].classList.add('enemies')
            enemiesPosizion[index]= position
        })

    }


    /**
        Movement function for enemies
     */
    function moveUpEnemie(position){
        const isOnTop=(position-GRID_WIDTH) < 0
        let tmp=position
        if(isOnTop)
        position = GRID_SIZE - GRID_WIDTH + position
        else
        position -= GRID_WIDTH
        if(squares[position].classList.contains("wall")){
            return tmp
        }
        return position
    }

    function moveDownEnemie(position){
        const isAtbuttom = (position+GRID_WIDTH) > GRID_SIZE
        let tmp = position
        if(isAtbuttom){
            position = (position+GRID_WIDTH)-GRID_SIZE
        }
        else
        position += GRID_WIDTH
        if(squares[position].classList.contains("wall")){
            return tmp
        }
        return position
    }

    function moveLeftEnemie(position){
        const isAtLeft = position%GRID_WIDTH == 0
        let tmp = position
        if (isAtLeft)
        position = position+GRID_WIDTH-1
        else
        position = position - 1
        if(squares[position].classList.contains("wall"))
        return tmp
        return position
    }

    function moveRightEnemie(position){
        const isAtRight = position%GRID_WIDTH == GRID_WIDTH -1
        let tmp = position
        if(isAtRight)
        position = position-GRID_WIDTH+1
        else 
        position = position +1
        if(squares[position].classList.contains("wall"))
        return tmp
        return position
    }




    function gameOver(){
        alert("Game Over")
        location.reload();
    }

    function gamewin(){
        alert("Win!!!")
        location.reload();
    }
    /*

    EVENT


    */
     //add functionality to the button 
     StartBtn.addEventListener('click',() => {
        if(timerId){
            clearInterval(timerId)
            clearInterval(enemiesInterval)
            enemiesInterval = null
            timerId = null
        }else{
            draw()
            timerId = setInterval(moveright,speed)
            enemiesInterval = setInterval(drawEnemies,speed)
        }
    })

})