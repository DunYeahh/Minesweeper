'use strict'

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
            if (cell.isMarked){
                tdAddition = ` <span>${MARK}</span> `
                className = ''
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

function getCellHTML(i, j){
    var value
    if (gBoard[i][j].isMine){
        value = ` <span>${MINE}</span> `
    } else if (gBoard[i][j].minesAroundCount){
        value = ` <span>${gBoard[i][j].minesAroundCount}</span> `
    } else value = ''
    return value
}

function expandReveal(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            //console.log(currCell)
            if (!currCell.isMine && currCell.isCovered && !currCell.isMarked) {
                gGame.revealedCount++
                board[i][j].isCovered = false
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove('notClicked')
                elCell.classList.add('clicked')
            }
            
        }
    }
}

function expandFullReveal(board, rowIdx, colIdx) {
    if (gEmptyCells.length){
        gEmptyCells.shift()
    } 
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            //console.log(currCell)
            if (!currCell.isMine && currCell.isCovered && !currCell.isMarked) {
                gGame.revealedCount++
                board[i][j].isCovered = false
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove('notClicked')
                elCell.classList.add('clicked')
                if (!currCell.minesAroundCount){
                    gEmptyCells.push({i, j})
                } 
            }
        }
    }
    if (!gEmptyCells.length) return
    expandFullReveal (board, gEmptyCells[0].i, gEmptyCells[0].j)
}
