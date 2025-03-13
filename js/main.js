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
    revealedCount: 0, 
    markedCount: 0,
    secsPassed: 0,  //address this
    livesCount: 3,
    score: 0
} 

function onInit(size){
    //closeModal()
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
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.livesCount = 3
    refreshHints()
    renderLives(3)
    var elSmileBtn = document.querySelector('.smile-btn')
    elSmileBtn.innerHTML = SMILE
    document.querySelector('.timer').innerText = '00:00'
}

function defineBoard(size){
    if (size === 4){
        gLevel.SIZE = 4
        gLevel.MINES = 2
        return
    }
    if (size === 8){
        gLevel.SIZE = 8
        gLevel.MINES = 14
        return
    }
    if (size === 12){
        gLevel.SIZE = 12
        gLevel.MINES = 32
        return
    }
}

function buildBoard(){
const board=[]
var cell = {}

//creating initial board
for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
            cell = {
                minesAroundCount: 0,
                isCovered: true, 
                isMine: false, 
                isMarked: false 
            }
            
            board[i][j] = cell
        }
    }
    //console.table ('board before mines: ', board)

    //console.table ('board after mines: ', board)

    return board
}

function placeCellsContent(board, clickedI=null, clickedJ=null){
    var placedMines = 0

    //placing mines
    while (placedMines !== gLevel.MINES){
        var randCell = getRandCell(0, gLevel.SIZE)
        //console.log ('randCell before placing: ', randCell)
        var currRandCell = board[randCell.i][randCell.j]
        //console.log ('currRandCell: ', randCell.i,' ',randCell.j, ' clicked: ', clickedI, ' ', clickedJ)
        if (!currRandCell.isMine && currRandCell !== board[clickedI][clickedJ]){
            currRandCell.isMine = true
            //console.log ('randCell after placing: ', randCell)
            placedMines++
            //console.log('placedMines: ', placedMines)
        }
    }

    //updating minesNegsCount
    setMinesNegsCount(board)
}

function setMinesNegsCount(board){
    for (var i = 0; i < gLevel.SIZE; i++){
        for (var j = 0; j < gLevel.SIZE; j++){
            board[i][j].minesAroundCount = countMinesNegs(board, i, j)
            //console.log ('board[i][j].minesAroundCount: ', board[i][j].minesAroundCount)
        }
    }
    //console.table('board with mines count: ',board)
}

function countMinesNegs(board, rowIdx, colIdx) {
    var count = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
            //console.log('currCell is mine: ', currCell)
            //console.log('mines count: ', count)
        }
    }
    return count
}

function renderBoard(board, rowIdx, colIdx){
    var strHTML = ''
    var cell
    
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr >\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            var tdAddition = ''
            var className = ' notClicked'
            cell = board[i][j]

            if (cell.isMine){
                tdAddition = ` <span>${MINE}</span> ` // For a cell that contains a MINE
                className += ' mine'
            } else if (cell.minesAroundCount !== 0) {
                tdAddition = ` <span>${cell.minesAroundCount}</span> ` // For a cell that is NEXT TO A MINE add the number
            } 
            if (i === rowIdx && j === colIdx){
                //console.log('strHTML of clicked: ', strHTML)
                strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell clicked"
            onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;" >${tdAddition}
            </td>\n`
            } else {
                strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell${className}"
                onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;" >${tdAddition}
                </td>\n`
                //console.log('strHTML: ', strHTML)
            }
            
        }
        strHTML += `</tr>\n`
        //console.log('strHTML: ', strHTML)
    }

    const elCells = document.querySelector('.board-cell')
    elCells.innerHTML = strHTML

}

function onCellClicked(elCell, i, j){
    if (gBoard[i][j].isMarked || !gBoard[i][j].isCovered) return
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

function renderLives(count){
    var strHTML=''
    for (var i = 0; i<count; i++){
        strHTML+=LIVE
    }
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = strHTML
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

function getCellHTML(i, j){
    var value
    if (gBoard[i][j].isMine){
        value = ` <span>${MINE}</span> `
    } else if (gBoard[i][j].minesAroundCount){
        value = ` <span>${gBoard[i][j].minesAroundCount}</span> `
    } else value = ''
    return value
}

function checkGameOver(){

    var deltWithCells = gGame.revealedCount + gGame.markedCount
    var deltWithMines = gGame.markedCount + (3 - gGame.livesCount)

    if (deltWithCells === gLevel.SIZE**2 && 
        deltWithMines === gLevel.MINES &&
        gGame.markedCount>0){
        var elSmileBtn = document.querySelector('.smile-btn')
        elSmileBtn.innerHTML = WIN
        gGame.isOn = false
        bestScoreUpdate(gLevel.SIZE)
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

function expandReveal(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isMine && currCell.isCovered) {
                gGame.revealedCount++
                board[i][j].isCovered = false
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove('notClicked')
                elCell.classList.add('clicked')
            }
            
        }
    }
}

function startTimer() {
    // if (gInterval) return
    var mins = 0
    var secs = 0
    var zero = '0'
    gInterval = setInterval(() => {
        secs++
        if (secs > 9) zero = ''
        if (secs === 59) {
            mins++
            secs = 0
            zero = '0'
        }
        if (mins > 9) gTimer = `${mins}:${zero}${secs}`
      else gTimer = `0${mins}:${zero}${secs}`
      document.querySelector('.timer').innerText = gTimer
  
      if (!gGame.isOn) {
        clearInterval(gInterval)
        gInterval = null
      }
    }, 1000)
  }

function onHint(elHint){
    if (elHint.classList.contains('clicked')) return
    elHint.classList.add('clicked')
    gIsHint = true
}
  
function refreshHints(){
    var elHints = document.querySelectorAll('.hints-container button')
    for (var i = 0; i<elHints.length; i++){
        var elHint = elHints[i]
        elHint.classList.remove('clicked')
        //console.log('elHint: ', elHint)
    }
}

function showHint(rowIdx, colIdx){
    console.log('entered showHint')
    for (var i = rowIdx-1; i<=rowIdx+1; i++){
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx-1; j<=colIdx+1; j++){
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isCovered) continue
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.classList.remove('notClicked')
            elCell.classList.add('hinted')
        }
    }

    setTimeout(() => {
    for (var i = rowIdx-1; i<=rowIdx+1; i++){
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx-1; j<=colIdx+1; j++){
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isCovered) continue
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.add('notClicked')
                elCell.classList.remove('hinted')
        }
    }
    }, 1500);
}

function bestScoreUpdate(level){
    switch (level){
        case 4:
        var levelName = 'beginner-best'
        break
        case 8:
        var levelName = 'medium-best'
        break
        case 12:
        var levelName = 'expert-best'
        break
    }
    console.log('levelName: ', levelName)
    console.log(`localStorage.getItem(${levelName}): `, localStorage.getItem(`${levelName}`))

    if (localStorage.getItem(`${levelName}`) >= gGame.score 
    || !localStorage.getItem(`${levelName}`)){
        // Store
        localStorage.setItem(`${levelName}`, gGame.score)
        // Retrieve
        var elBestScore = document.querySelector(`.${levelName}`)
        console.log('elBestScore: ', elBestScore)
        elBestScore.innerHTML = localStorage.getItem(`${levelName}`)
    }

}