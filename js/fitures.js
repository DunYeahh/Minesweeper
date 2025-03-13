'use strict'

function renderLives(count){
    var strHTML=''
    for (var i = 0; i<count; i++){
        strHTML+=LIVE
    }
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = strHTML
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
        gGame.score = getScore(mins, secs)
        //console.log('gGame.score: ', gGame.score)
        if (gGame.isWin) bestScoreUpdate(gLevel.SIZE)
      }
    }, 1000)
}

  function onHint(elHint){
    if (!gGame.revealedCount) return
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
    for (var i = rowIdx-1; i<=rowIdx+1; i++){
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx-1; j<=colIdx+1; j++){
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].isCovered) continue
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            elCell.classList.toggle('hinted')
            elCell.classList.toggle('notClicked')
            //console.log(elCell)
        }
    }
}

function bestScoreUpdate(level){
    //console.log('entered bestScoreUpdate')
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
    //console.log('levelName: ', levelName)
    //console.log(`localStorage.getItem(${levelName}): `, localStorage.getItem(`${levelName}`))

    if (localStorage.getItem(`${levelName}`) > gGame.score 
    || !localStorage.getItem(`${levelName}`)){
        // Store
        localStorage.setItem(`${levelName}`, gGame.score)
        // Retrieve
        var elBestScore = document.querySelector(`.${levelName}`)
        //console.log('elBestScore: ', elBestScore)
        var scoreDisplay = getScoreDisplay(localStorage.getItem(`${levelName}`))
        elBestScore.innerHTML = scoreDisplay
    }
}

function getScoreDisplay(score){
    if (!score) return ''
    //console.log('entered getScoreDisplay')
    //console.log('score: ', score )
    var nums = score.split('')
    //console.log('nums: ', nums)
    nums.splice (nums.length-2 , 0 , ':')
    if (nums.length === 3) nums.unshift(0,0)
        else if (nums.length === 4) nums.unshift(0)
    //console.log('nums: ', nums)
    score = nums.join('')
    //console.log('score: ', score)
    return score
}

function onBestScores(){
    var elBestScore = document.querySelector(`.beginner-best`)
    elBestScore.innerHTML = getScoreDisplay(localStorage.getItem(`beginner-best`))

    var elBestScore = document.querySelector(`.medium-best`)
    elBestScore.innerHTML = getScoreDisplay(localStorage.getItem(`medium-best`))

    var elBestScore = document.querySelector(`.expert-best`)
    elBestScore.innerHTML = getScoreDisplay(localStorage.getItem(`expert-best`))
}

function getScore(mins, secs){
    //console.log('entered getScore')
    if (secs<10){
        secs = '0' + secs
    }
    //console.log('secs: ', secs)
    //console.log('mins: ', mins)
    var score = mins + '' + secs + ''
    //console.log('score: ', score)
    return score
}

function onSafeClick(elBtn){
    //console.log(gGame.safeClicksLeft)
    if (!gGame.safeClicksLeft){
        elBtn.classList.add('finished')
        setTimeout(() => {
            elBtn.classList.remove('finished')
        }, 500);
        return
    } 
    //console.log(gGame.safeClicksLeft)
    elBtn.classList.add('clicked')
    setTimeout(() => {
        elBtn.classList.remove('clicked')
    }, 150);
    gGame.safeClicksLeft--
    elBtn.querySelector('span').innerHTML = gGame.safeClicksLeft
    showSafeClick(gBoard, elBtn)
}

function showSafeClick(board, elBtn){
    console.log('entered')
    var isDone = false
    var areSafe = areSafeCells(board)
    while(!isDone && areSafe){
    var randCell = getRandCell(0,board.length)
    var currCell = board[randCell.i][randCell.j]
    console.log('currCell: ', currCell)
    if (currCell.isCovered
        && !currCell.isMarked
        && !currCell.isMine){
            var elCell = document.querySelector(`[data-i="${randCell.i}"][data-j="${randCell.j}"]`)
            elCell.classList.remove('notClicked')
            elCell.classList.add('clicked')
            console.log('elCell: ', elCell)

            setTimeout(() => {
                elCell.classList.add('notClicked')
                elCell.classList.remove('clicked')

            }, 1500);
            isDone = true
        }
    }
    if (!areSafe){
        elBtn.innerHTML = 'No Safe Cells Left'
    }
}

function areSafeCells(board){
    for (var i = 0; i<board.length; i++){
        for (var j = 0; j<board[0].length; j++){
            if (board[i][j].isCovered && !board[i][j].isMine && !board[i][j].isMarked){
                return true
            }
        }
    }
    return false
}

function onStyleMode(elbtn){
    isDark=!isDark

    if (isDark){
        document.querySelector("link[rel='stylesheet']").href = "css/dark-mode.css"
        elbtn.querySelector('span').innerHTML = 'Light'
    } else{
        document.querySelector("link[rel='stylesheet']").href = "css/light-mode.css"
        elbtn.querySelector('span').innerHTML = 'Dark'
    } 
}