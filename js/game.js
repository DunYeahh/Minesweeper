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
var gEmptyCells = []
var isDark = false

var gBoard = []

var gLevel = { 
    SIZE: 4, 
    MINES: 2 
} 

var gGame = { 
    isOn: false,
    isWin: false, 
    revealedCount: 0, 
    markedCount: 0,
    livesCount: 3,
    score: Infinity,
    safeClicksLeft: 3,
    previousMoves: [],
    undoCount: 0
} 

function onInit(size){
    // localStorage.removeItem('beginner-best');
    // localStorage.removeItem('medium-best');
   
    refreshGame()
    defineBoard(size)
    gGame.isOn = true
    gBoard = buildBoard()
    saveCurrState()
    console.log('gBoard: ', gBoard)
    // console.table('gGame.previousMoves: ', gGame.previousMoves)    
    renderBoard(gBoard)
}

function refreshGame(){

    gGame = { 
        isOn: false,
        isWin: false, 
        revealedCount: 0, 
        markedCount: 0,
        livesCount: 3,
        score: Infinity,
        safeClicksLeft: 3,
        previousMoves: [],
        undoCount: 0
    } 
    refreshHints()
    renderLives(3)
    clearInterval(gInterval)
    gInterval = null
    var elSmileBtn = document.querySelector('.smile-btn')
    elSmileBtn.innerHTML = SMILE
    document.querySelector('.timer').innerText = '00:00'
    document.querySelector('.safe-click').innerHTML = `SAFE CLICK <br><span>3</span> clicks left`
}

function onCellClicked(elCell, i, j){
    
    if (gBoard[i][j].isMarked || !gBoard[i][j].isCovered) return
    if (!gGame.isOn) return
    if (!gGame.revealedCount && gGame.undoCount === 0){
        placeCellsContent (gBoard, i, j)
        renderBoard (gBoard, i, j)
        startTimer()
    }
    if (gIsHint){
        gIsHint = false
        if (!gBoard[i][j].isCovered) return
        showHint(i, j)
        setTimeout(() => {
            showHint(i, j)
        }, 1500);
        return
    }
    gGame.revealedCount++
    gBoard[i][j].isCovered = false
    
    if (gBoard[i][j].isMine) handleMines(elCell)
    else handleBlanksAndNums(elCell, i, j)

    saveCurrState()

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
        expandFullReveal(gBoard, i, j)
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
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        var value = getCellHTML(i, j)
        elCell.innerHTML = value
        gGame.markedCount--
    }
    elCell.classList.toggle('notClicked')
    saveCurrState()
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

function saveCurrState(){

    var board = gBoard.slice()
    var livesCount = gGame.livesCount
    var markedCount = gGame.markedCount
    var revealedCount = gGame.revealedCount
    gGame.previousMoves.unshift({board, livesCount, markedCount, revealedCount})
    console.table('gGame.previousMoves: ', gGame.previousMoves)
}