//Constants (Beginner: 9x9,10 mines, Intermediate: 16x16,40 mines, Expert: 30x16, 99 mines) 25px if not beginner
const DIFFICULTY = localStorage.getItem("difficulty")
var GRID_HEIGHT
var GRID_WIDTH
var NUM_OF_MINES
var tileSize
var gameOver = false
const remainingMinesLabel = document.getElementById("minesLabel")
var gameStarted = false
const diffLabel = document.getElementById("diffLabel")
var emptyValue = false
switch (DIFFICULTY){
    case "custom":
        GRID_HEIGHT = localStorage.getItem("customHeight")
        GRID_WIDTH = localStorage.getItem("customWidth")
        NUM_OF_MINES = localStorage.getItem("customMines")
        if(GRID_WIDTH === '' || GRID_HEIGHT === '' || NUM_OF_MINES === ''){ //Sets diff to easy if custom values aren't selected
            GRID_HEIGHT = 9
            GRID_WIDTH = 9
            NUM_OF_MINES = 10
            tileSize = 40
            emptyValue = true
            break
        }

        diffLabel.innerHTML = "Custom"
        diffLabel.style.color = "blue"

        document.getElementById("customInputDiv").style.visibility = "visible"
        document.getElementById("height").value = GRID_HEIGHT
        document.getElementById("width").value = GRID_WIDTH
        document.getElementById("numOfMines").value = NUM_OF_MINES
        tileSize = 25
        break
    case "medium":
        diffLabel.innerHTML = "Medium"
        diffLabel.style.color = "yellow"
        GRID_HEIGHT = 16
        GRID_WIDTH = 16
        NUM_OF_MINES = 40
        tileSize = 25
        break
    case "hard":
        diffLabel.innerHTML = "Hard"
        diffLabel.style.color = "red"
        GRID_HEIGHT = 16
        GRID_WIDTH = 30
        NUM_OF_MINES = 99
        tileSize = 25
        break
    case "easy":
    case null:
    default:
        diffLabel.innerHTML = "Easy"
        diffLabel.style.color = "#31FF2B"
        GRID_HEIGHT = 9
        GRID_WIDTH = 9
        NUM_OF_MINES = 10
        tileSize = 40
        break
}

//Remaining mines label
document.getElementById("minesLabel").innerHTML = NUM_OF_MINES

//Keeps current difficulty selected
if(DIFFICULTY !== null && !emptyValue) {
    document.getElementById(DIFFICULTY).checked = true
} else {
    document.getElementById("easy").checked = true
}

//Choosing random mine locations
const mines = []
for(let i = 0; i < NUM_OF_MINES; i++){
    const x = Math.floor(Math.random() * GRID_HEIGHT)
    const y = Math.floor(Math.random() * GRID_WIDTH)
    var coords = x.toString() + "," + y.toString()
    if(mines.includes(coords)){
        i--;
    } else {
        mines[i] = coords
    }
    if(mines.length === (GRID_HEIGHT * GRID_WIDTH)) break //Stops infinite loop if too many mines are entered
}

//Building the grid
var remainingTiles = GRID_HEIGHT * GRID_WIDTH
var flaggedTiles = []
for(let i = 0; i < GRID_HEIGHT; i++) {
    for (let j = 0; j < GRID_WIDTH; j++) {
        const coords = i.toString() + "," + j.toString()
        const newTile = document.createElement("input")
        newTile.type = "image"
        newTile.src = "img/square.png"
        newTile.id = coords
        newTile.style.height = newTile.style.width = tileSize + "px"

        //Right-click to add/remove flag
        newTile.oncontextmenu = function () {
            if(!gameStarted) { //Starts timer on first click
                startTimer()
                gameStarted = true
            }
            if(newTile.src.endsWith("square.png") && !gameOver){
                newTile.src = "img/flag.png"
                remainingMinesLabel.innerHTML--
                flaggedTiles.push(newTile.id)
            } else if(newTile.src.endsWith("flag.png") && !gameOver){
                newTile.src = "img/square.png"
                remainingMinesLabel.innerHTML++
                flaggedTiles.splice(flaggedTiles.indexOf(newTile.id),1)
            }
            return false
        }

        //On left click
        if(mines.includes(coords)) {
            newTile.addEventListener("click", function () {
                if(newTile.src.endsWith("square.png") && !gameOver) {
                    newTile.style.backgroundColor = "red"
                    gameLost()
                }
            })
        } else {
            newTile.addEventListener("click", function () {
                if(!gameOver) {
                    if(!gameStarted) { //Starts timer on first click
                        startTimer()
                        gameStarted = true
                    }
                    var count = countAdjacent(newTile)
                    if (count === 0 && !flaggedTiles.includes(newTile.id)) {
                        revealAdjacent(newTile)
                    } else if (newTile.src.endsWith("square.png")) {
                        newTile.style.backgroundColor = "gray"
                        newTile.src = "img/" + count + ".png"
                        remainingTiles--
                        if (remainingTiles <= NUM_OF_MINES) gameWin()
                    }
                }
            })
        }

        //Adding the tile to the grid
        document.getElementById("cntr").appendChild(newTile)
    }
    //Making a new row
    const new_line = document.createElement("br")
    document.getElementById("cntr").appendChild(new_line)
}

//Custom game entries
const inputDiv = document.getElementById("customInputDiv")
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('click', function (){
        if(document.getElementById("custom").checked){
            inputDiv.style.visibility = "visible"
        } else {
            inputDiv.style.visibility = "hidden"
        }
    })
})

//New game button
document.getElementById("newGameButton").addEventListener('click',function () {
    if(document.querySelector('input[name="difficulty"]:checked').value === "custom"){
        document.getElementById("numOfMines").required = document.getElementById("height").required = document.getElementById("width").required = true //Require custom inputs if selected
        localStorage.setItem("customHeight",document.getElementById("height").value)
        localStorage.setItem("customWidth",document.getElementById("width").value)
        localStorage.setItem("customMines",document.getElementById("numOfMines").value)
    } else {
        document.getElementById("numOfMines").required = document.getElementById("height").required = document.getElementById("width").required = false //Allow new game to start without custom inputs
    }
    localStorage.setItem("difficulty",document.querySelector('input[name="difficulty"]:checked').value)
})

function countAdjacent(tile) {
    if(tile === null) return 0
    const arr = tile.id.split(',')
    const i = parseInt(arr[0])
    const j = parseInt(arr[1])
    var count = 0

    //If mine is below
    if(mines.includes( (i+1).toString() + "," + j.toString())){
        count++
    }

    //If mine is on right
    if(mines.includes( (i).toString() + "," + (j+1).toString())){
        count++
    }

    //If mine is above
    if(mines.includes( (i-1).toString() + "," + (j).toString())){
        count++
    }

    //If mine is on left
    if(mines.includes( (i).toString() + "," + (j-1).toString())){
        count++
    }

    //If mine is on top left
    if(mines.includes( (i-1).toString() + "," + (j-1).toString())){
        count++
    }

    //If mine is on top right
    if(mines.includes( (i-1).toString() + "," + (j+1).toString())){
        count++
    }

    //If mine is on bottom left
    if(mines.includes( (i+1).toString() + "," + (j-1).toString())){
        count++
    }

    //If mine is on bottom right
    if(mines.includes( (i+1).toString() + "," + (j+1).toString())){
        count++
    }

    return count
}

function revealAdjacent(tile) {
    if(tile === null || tile.src.endsWith("0.png")) return
    const arr = tile.id.split(',')
    const i = parseInt(arr[0])
    const j = parseInt(arr[1])
    var currentTile
    var count

    setBlank(tile)

    //Top left
    currentTile = document.getElementById((i-1) + "," + (j-1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Top
    currentTile = document.getElementById((i-1) + "," + (j))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Top right
    currentTile = document.getElementById((i-1) + "," + (j+1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Right
    currentTile = document.getElementById((i) + "," + (j+1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Bottom right
    currentTile = document.getElementById((i+1) + "," + (j+1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Bottom
    currentTile = document.getElementById((i+1) + "," + (j))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Bottom left
    currentTile = document.getElementById((i+1) + "," + (j-1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }

    //Left
    currentTile = document.getElementById((i) + "," + (j-1))
    if(currentTile !== null) {
        count = countAdjacent(currentTile)
        if (count === 0) {
            revealAdjacent(currentTile)
        } else if(currentTile.src.endsWith("square.png")){
            currentTile.style.backgroundColor = "gray"
            currentTile.src = "img/" + count + ".png"
            remainingTiles--
            if(remainingTiles <= NUM_OF_MINES) gameWin()
        }
    }
}

function setBlank(tile){
    if(tile === null) return
    if(tile.src.endsWith("square.png")){
        tile.style.backgroundColor = "gray"
        tile.src = "img/0.png"
        remainingTiles--
        if(remainingTiles <= NUM_OF_MINES) gameWin()
    }
}

function gameWin() {
    gameOver = true
    clearInterval(intervalID) //Stops timer
    remainingMinesLabel.innerHTML = 0

    //Mark mines as flag
    for(var coords of mines){
        document.getElementById(coords).src = "img/flag.png"
    }

    const gameOverText = document.getElementById("gameOverText")
    gameOverText.innerHTML = "You win!"
    gameOverText.style.color = "green"
    gameOverText.style.visibility = "visible"}

function gameLost(){
    gameOver = true
    clearInterval(intervalID) //Stops timer

    //Reveal all unflagged mines
    for(var coords of mines){
        const tile = document.getElementById(coords)
        if(!tile.src.endsWith("flag.png")) { //Don't remove correct flags
            tile.src = "img/mine.ico"
            if (tile.style.backgroundColor !== "red") tile.style.backgroundColor = "gray"
        }
    }

    for(var fCoords of flaggedTiles){
        if(!mines.includes(fCoords)) {
            document.getElementById(fCoords).src = "img/minex.png"
            document.getElementById(fCoords).style.backgroundColor = "gray"
        }
    }

    const gameOverText = document.getElementById("gameOverText")
    gameOverText.innerHTML = "You lost!"
    gameOverText.style.color = "crimson"
    gameOverText.style.visibility = "visible"
}

//Timer
const hr = document.getElementById("hour")
const min = document.getElementById("minute")
const sec = document.getElementById("second")
var intervalID
function startTimer() {
    intervalID = setInterval(function () {
        timerPlus(sec)
        if (sec.innerHTML >= 60) {
            timerPlus(min)
            sec.innerHTML = "00"
        }
        if (min.innerHTML >= 60) {
            timerPlus(hr)
            min.innerHTML = "00"
        }
    }, 1000)
}

var temp = 0
function timerPlus(label) {
    temp = parseInt(label.innerHTML)
    temp++
    label.innerHTML = ('0' + temp).slice(-2)
}