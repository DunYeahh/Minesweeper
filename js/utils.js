'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function openModal(note) {
    const elModal = document.querySelector('.modal')
    const elH2=document.querySelector('.modal h2')
    elH2.innerHTML=note
    elModal.classList.remove('hide')
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.add('hide')
}

function getRandomColor(){
    var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandCell(from, to){
    var randCell ={
        i: getRandomInt(from, to),
        j: getRandomInt(from, to)
    }
    //console.log(randCell)
return randCell
}

function getEmptyCells(board){
    var emptys=[]
    for (var i=0;i<board.length;i++){
        for (var j=0; j<board[0].length;j++){
            if (board[i][j]===EMPTY) emptys.push({i,j})
        }
    }
    console.log('emptys: ', emptys)
    return emptys
}

