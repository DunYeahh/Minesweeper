'use strict'

const MINE = '💣'
const MARK = '🚩'
const LIVE = '❤️'
const WIN = '😎'
const LOSE = '🤯'
const SMILE = '😀'

var gInterval = null
var gTimer = null
var gIsHint = false

var gBoard = []

var gLevel = { 
    SIZE: 0, 
    MINES: 0 
} 

var gGame = { 
    isOn: false,
    isWin: false, 
    revealedCount: 0, 
    markedCount: 0,
    secsPassed: 0,  //address this
    livesCount: 3,
    score: Infinity
} 

function onInit(size){
    // localStorage.removeItem('beginner-best');
    // localStorage.removeItem('medium-best');
   
    refreshGame()
    defineBoard(size)
    gGame.isOn = true
    gBoard = buildBoard()
    console.log('gBoard: ', gBoard)
    renderBoard(gBoard)
    startTimer()
}

function refreshGame(){
    gGame.isOn = true
    gGame.isWin = false
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.livesCount = 3
    refreshHints()
    renderLives(3)
    clearInterval(gInterval)
    gInterval = null
    var elSmileBtn = document.querySelector('.smile-btn')
    elSmileBtn.innerHTML = SMILE
    document.querySelector('.timer').innerText = '00:00'
}

function onCellClicked(elCell, i, j){
    if (gBoard[i][j].isMarked || !gBoard[i][j].isCovered) return
    if (!gGame.isOn) return
    if (!gGame.revealedCount){
        placeCellsContent (gBoard, i, j)
        renderBoard (gBoard, i, j)
    }
    if (gIsHint){
        if (!gBoard[i][j].isCovered) return
        gIsHint = false
        //console.log ('gIsHint (onClicked): ', gIsHint)
        showHint(i, j)
        return
    }
    gGame.revealedCount++
    gBoard[i][j].isCovered = false
    
    if (gBoard[i][j].isMine) handleMines(elCell)
    else handleBlanksAndNums(elCell, i, j)

    checkGameOver()   
}

function handleMines(elCell){
    elCell.classList.remove('notClicked')
    elCell.classList.add('clickedMine')
    gGame.livesCount--
    renderLives(gGame.livesCount)
}

function handleBlanksAndNums(elCell, i, j){
    if (!gBoard[i][j].minesAroundCount) {
        expandReveal(gBoard, i, j)
    } 
    elCell.classList.remove('notClicked')
    elCell.classList.add('clicked')
}

function onCellMarked(elCell, i, j) {
    if (!gBoard[i][j].isCovered) return
    if (!gBoard[i][j].isMarked){
        gBoard[i][j].isMarked = true
        var value = ` <span>${MARK}</span> `
        elCell.innerHTML = value
        elCell.classList.remove('notClicked')
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        var value = getCellHTML(i, j)
        elCell.innerHTML = value
        elCell.classList.add('notClicked')
        gGame.markedCount--
        //console.log('gGame.markedCount: ', gGame.markedCount)
    }
    checkGameOver()
}

function checkGameOver(){

    var deltWithCells = gGame.revealedCount + gGame.markedCount
    var deltWithMines = gGame.markedCount + (3 - gGame.livesCount)

    if (deltWithCells === gLevel.SIZE**2 && 
        deltWithMines === gLevel.MINES &&
        gGame.markedCount>0){
        gGame.isOn = false
        gGame.isWin = true
        var elSmileBtn = document.querySelector('.smile-btn')
        elSmileBtn.innerHTML = WIN
    } else if (gGame.livesCount === 0
        || (3 - gGame.livesCount) === gLevel.MINES){
        var elMines = document.querySelectorAll('.mine')
        for (var i = 0; i<elMines.length; i++){
            var elMine = elMines[i]
            elMine.classList.remove('notClicked')
            elMine.classList.add('clicked')
        }
        var elSmileBtn = document.querySelector('.smile-btn')
        elSmileBtn.innerHTML = LOSE
        gGame.isOn = false
    }
}