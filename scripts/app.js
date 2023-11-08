//! Elements
const grid = document.querySelector('.grid')
const gridContainer = document.querySelector('.grid-container')
const levelButtons = document.getElementsByClassName('levels')
const resetButton = document.querySelector('#reset')
const timeDisplay = document.querySelectorAll('#time')
const difficultyDisplay = document.getElementById('difficulty')
const bombsDisplay = document.querySelector('#bombsNbr')
const rulesButton = document.querySelector('.rules')
const closeButtons = document.getElementsByClassName('close')
let cells = []

console.log(difficultyDisplay)

//! Variables
let gameActive = false
let time

const levels = [
  { difficulty: 'BEGINNER', bombsNbr: 10, width: 8, height: 8 },
  { difficulty: 'INTERMEDIATE', bombsNbr: 40, width: 16, height: 16 },
  { difficulty: 'EXPERT', bombsNbr: 80, width: 32, height: 16 }
]

let levelChoice = levels[0]

let width = levelChoice.width
let height = levelChoice.height
let cellCount = width * height
let bombsNbr = levelChoice.bombsNbr
let interval

//! Grid

function resetVariables() {
  clearInterval(interval)
  grid.replaceChildren()
  cells = []
  time = 0
  for (const display of timeDisplay){
    display.innerText = time
  }
  bombsDisplay.innerText = bombsNbr
  resetButton.style.backgroundImage = 'url(images/reset.png)'
  // gameActive = false
}

class SurroundingCells {
  constructor(cell) {
    this.cell = cell
    this.NW = this.cell - width - 1
    this.N = this.cell - width
    this.NE = this.cell - width + 1
    this.E = this.cell + 1
    this.SE = this.cell + width + 1
    this.S = this.cell + width
    this.SW = this.cell + width - 1
    this.W = this.cell - 1
  }

  arrayOfSurroundingCells() {
    if (this.cell === 0) { //Top Left Corner
      return [this.E, this.S, this.SE]
    } else if (this.cell === width - 1) { //Top Right Corner
      return [this.S, this.W, this.SW]
    } else if (this.cell === cellCount - 1) { //Bottom Right Corner
      return [this.N, this.W, this.NW]
    } else if (this.cell === cellCount - width) { //Bottom Left Corner
      return [this.N, this.E, this.NE]
    } else if (this.cell < width) { //First Row
      return [this.E, this.S, this.W, this.SE, this.SW]
    } else if ((this.cell + 1) % width === 0) { //Last Column
      return [this.N, this.S, this.W, this.NW, this.SW]
    } else if (this.cell >= cellCount - width) { //Bottom Row
      return [this.N, this.E, this.W, this.NE, this.NW]
    } else if (this.cell % width === 0) { //First Column
      return [this.N, this.E, this.S, this.NE, this.SE]
    } else { // midfield
      return [this.N, this.E, this.S, this.W, this.NW, this.NE, this.SE, this.SW]
    }
  }
}

function createGrid() {
  resetVariables()
  // gameActive = true
  grid.replaceChildren()
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div')
    cell.style.width = `${100 / width}%`
    cell.style.height = `${100 / height}%`
    cell.innerText = '-'
    grid.append(cell)
    cells.push(cell)
    cell.classList.add('cell')
    eventsOnCells()
  }
  mineField()

  for (let cell = 0; cell < cellCount; cell++) {
    dangerNbr(cell)
  }

  cells.forEach(function (index) {
    if (index.classList.contains('bomb')) {
      index.classList.remove('nbr')
    }
    if (!index.classList.contains('nbr') && !index.classList.contains('bomb')) {
      index.classList.add('safeZone')
    }
  })

  if (levelChoice === levels[0]) {
    grid.style.width = '200px'
    grid.style.height = '200px'
    grid.style.backgroundImage = 'url(images/hay-house.jpeg)'
    gridContainer.style.backgroundImage = 'url(images/hayStack.jpeg)'
  } else if (levelChoice === levels[1]) {
    grid.style.width = '400px'
    grid.style.height = '400px'
    grid.style.backgroundImage = 'url(images/timber-house.jpeg)'
    gridContainer.style.backgroundImage = 'url(images/oak-cobbles.jpeg)'
  } else if (levelChoice === levels[2]) {
    grid.style.width = '800px'
    grid.style.height = '400px'
    grid.style.backgroundImage = 'url(images/brick-house.jpeg)'
    gridContainer.style.backgroundImage = 'url(images/brick-bckgnd.jpeg)'
  }
}

function updateGrid(evt) {
  resetVariables()
  gameActive = true
  if (evt.target.classList.contains('easy')) {
    levelChoice = levels[0]
  } else if (evt.target.classList.contains('hard')) {
    levelChoice = levels[1]
  } else if (evt.target.classList.contains('expert')) {
    levelChoice = levels[2]
  }
  width = levelChoice.width
  height = levelChoice.height
  cellCount = width * height
  bombsNbr = levelChoice.bombsNbr
  createGrid()
}

function dangerNbr(cell) {
  let dangerCount = 0
  const NW = cell - width - 1
  const N = cell - width
  const NE = cell - width + 1
  const E = cell + 1
  const SE = cell + width + 1
  const S = cell + width
  const SW = cell + width - 1
  const W = cell - 1

  function updateDangerCount(query) {
    if (cells[query].classList.contains('bomb')) {
      dangerCount++
    }
  }

  if (cell < width && cell % height === 0) { // console.log('topLeftCorner: ' + cell)
    [E, SE, S].forEach(updateDangerCount)
  } else if (cell < width && (cell + 1) % height === 0) { // console.log('topRigtCorner: ' + cell)
    [S, SW, W].forEach(updateDangerCount)
  } else if (cell >= cellCount - width && (cell + 1) % height === 0) { // console.log('bottomRigtCorner: ' + cell)
    [NW, N, W].forEach(updateDangerCount)
  } else if (cell >= cellCount - width && cell % height === 0) { // console.log('bottomLeftCorner: ' + cell)
    [N, NE, E].forEach(updateDangerCount)
  } else if (cell < width) { // console.log('first row: ' + cell)
    [E, SE, S, SW, W].forEach(updateDangerCount)
  } else if (cell >= cellCount - width) { // console.log('last row: ' + cell)
    [NW, N, NE, E, W].forEach(updateDangerCount)
  } else if (cell % height === 0) { // console.log('first column: ' + cell)
    [N, NE, E, SE, S].forEach(updateDangerCount)
  } else if ((cell + 1) % height === 0) { // console.log('last column: ' + cell)
    [NW, N, S, SW, W].forEach(updateDangerCount)
  } else { // console.log('midField: ' + cell)
    [NW, N, NE, E, SE, S, SW, W].forEach(updateDangerCount)
  }

  cells[cell].innerText = dangerCount
  // cells[cell].setAttribute('id', 'nbr' + dangerCount)

  if (cells[cell].innerText > 0) {
    cells[cell].classList.add('nbr')
  }
}

function mineField() {
  const bombsArray = []
  let hotSpots = []
  for (let i = 0; i < bombsNbr; i++) {
    while (hotSpots.length < bombsNbr) {
      const index = Math.floor(Math.random() * cellCount)
      bombsArray.push(index)
      // remove duplicates
      hotSpots = bombsArray.filter((value, index) => bombsArray.indexOf(value) === index)
      cells[index].classList.add('bomb')
    }
  }
}

//! Execution

function startGame() {
  clearInterval(interval)
  interval = setInterval(() => {
    time++
    for (const display of timeDisplay){
      display.innerText = time
    }
  }, 1000)
}

function winGame() {
  const allCells = document.querySelectorAll('.cell')
  const openCells = []
  allCells.forEach(function (cell){
    if (cell.classList.contains('nbrClicked') || cell.classList.contains('flag') || cell.classList.contains('safeZoneClicked')){
      openCells.push(cell)
      if (openCells.length === cellCount){
        clearInterval(interval)
        difficultyDisplay.innerText = levelChoice.difficulty
        document.getElementById('win').classList.add('popupDisplay')
      }
    }
  })
  // timeDisplay.innerText = time
}

function reveal(event) {
  startGame()
  const cellClicked = event.target
  const allBombs = document.querySelectorAll('.bomb')
  const allCells = document.querySelectorAll('.cell')
  if (cellClicked.classList.contains('bomb')) {
    allBombs.forEach(function (item) {
      item.classList.replace('bomb', 'bombClicked')
      clearInterval(interval)
      resetButton.style.backgroundImage = 'url(images/badWolf.png)'
      document.getElementById('lost').classList.add('popupDisplay')
      allCells.forEach(function (cell) {
        cell.setAttribute('disabled', true)
        cell.removeEventListener('contextmenu', addFlag)
        cell.removeEventListener('click', reveal)
      })
    })
  } else if (cellClicked.classList.contains('nbr')) {
    cellClicked.classList.replace('nbr', 'nbrClicked')
    cellClicked.removeEventListener('contextmenu', addFlag)
    winGame()
  } else if (cellClicked.classList.contains('safeZone')) {
    cellClicked.classList.replace('safeZone', 'safeZoneClicked')
    cellClicked.removeEventListener('contextmenu', addFlag)
    openEmptyBubbles(cellClicked)
  }
  if (cellClicked.classList.contains('nbrClicked')) {
    cellClicked.setAttribute('id', 'nbr' + cellClicked.innerText)
  }
  
}

function openEmptyBubbles(cellClicked) {
  const cellClickedIndex = cells.indexOf(cellClicked)

  let fieldInPlay = new SurroundingCells(cellClickedIndex)
  let arrayToCheck = fieldInPlay.arrayOfSurroundingCells()

  arrayToCheck.forEach(extendFieldToCheck)

  function extendFieldToCheck(query) {
    while (cells[query].classList.contains('safeZone')) {
      cells[query].classList.replace('safeZone', 'safeZoneClicked')
      cells[query].removeEventListener('contextmenu', addFlag)
      fieldInPlay = new SurroundingCells(query)
      arrayToCheck = fieldInPlay.arrayOfSurroundingCells(query)
      arrayToCheck.forEach(extendFieldToCheck)
    } if (cells[query].classList.contains('nbr')) {
      cells[query].classList.replace('nbr', 'nbrClicked')
      cells[query].removeEventListener('contextmenu', addFlag)
      cells[query].setAttribute('id', 'nbr' + cells[query].innerText)
    }
  }
}

function addFlag(event) {
  event.preventDefault()
  startGame()
  if (event.target.classList.contains('flag')) {
    event.target.classList.remove('flag')
    eventsOnCells()
    bombsNbr++
    bombsDisplay.innerText = bombsNbr
  } else if (!event.target.classList.contains('flag')) {
    event.target.classList.add('flag')
    event.target.removeEventListener('click', reveal)
    bombsNbr--
    bombsDisplay.innerText = bombsNbr
    winGame()
  }
}

function clearAllInterval() {
}

//! Events
for (const button of levelButtons) {
  button.addEventListener('click', updateGrid)
}
rulesButton.addEventListener('click', popupRules)

function popupRules() {
  document.getElementById('rules').classList.add('popupDisplay')
}

for (const button of closeButtons) {
  button.addEventListener('click', popupClose)
}

function popupClose() {
  document.getElementById('rules').classList.remove('popupDisplay')
  document.getElementById('lost').classList.remove('popupDisplay')
  document.getElementById('win').classList.remove('popupDisplay')
}

const activated = true

function eventsOnCells() {
  for (const cell of cells) {
    cell.addEventListener('click', reveal)
    cell.addEventListener('contextmenu', addFlag)
  }
}

// function removeEventsOnCells() {
//   for (const cell of cells) {
//     cell.removeEventListener('click', reveal)
//     cell.removeEventListener('click', addFlag)
//   }
// }

// function removeFlagEventsOnCells() {
//   for (const cell of cells) {
//     cell.removeEventListener('click', addFlag)
//   }
// }

resetButton.addEventListener('click', updateGrid)

//! Page Load
createGrid()
localStorage.setItem('high-score', 0)
// highScoreDisplay.innerText = localStorage.getItem('high-score')