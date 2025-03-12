'use strict'

const MINE = '💣'
const MARK = '🚩'

var gBoard = []

var gLevel = { 
    SIZE: 4, 
    MINES: 2 
} 

var gGame = { 
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, //address this
    secsPassed: 0  //address this
} 

function onInit(){
    gGame.isOn = true
    gBoard = buildBoard()
    console.log('gBoard: ', gBoard)
    renderBoard(gBoard)
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

function placeCellsContent(board, clickedI, clickedJ){
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

function renderBoard(board){
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
            } else if (cell.minesAroundCount !== 0) {
                tdAddition = ` <span>${cell.minesAroundCount}</span> ` // For a cell that is NEXT TO A MINE add the number
            } else {
                className += ' empty' // For a cell that is EMPTY add an empty class
            } 

            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell${className}"
            onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this); return false;" >${tdAddition}
            </td>\n`
        }
        strHTML += `</tr>\n`
        //console.log('strHTML: ', strHTML)
    }

    const elCells = document.querySelector('.board-cell')
    elCells.innerHTML = strHTML

}

function onCellClicked(elCell, i, j){
    console.log(!gGame.revealedCount)
    if (!gGame.revealedCount){
        placeCellsContent (gBoard, i, j)
        renderBoard (gBoard)
    }
    gGame.revealedCount++
    gBoard[i][j].isCovered = false
    elCell.classList.remove('notClicked')
    //if (gBoard[i][j].isMine)
    
}

function onCellMarked(elCell) {
    
}

function checkGameOver(){

}

function expandReveal(board, elCell, i, j) {

}
