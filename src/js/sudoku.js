const GRID_SIZE = 9
const BOX_SIZE = 3
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_SOLVED_BOARD_ATTEMPTS = 30
const MAX_PUZZLE_ATTEMPTS = 40

function toIndex(row, col) {
  return row * GRID_SIZE + col
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffleArray(values) {
  const numbers = [...values]
  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const temp = numbers[index]
    numbers[index] = numbers[swapIndex]
    numbers[swapIndex] = temp
  }
  return numbers
}

function createEmptyMatrix() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
}

function toMatrix(board) {
  if (!Array.isArray(board)) {
    return createEmptyMatrix()
  }

  if (Array.isArray(board[0])) {
    return board.map(row => [...row])
  }

  if (board.length !== TOTAL_CELLS) {
    return createEmptyMatrix()
  }

  return Array.from({ length: GRID_SIZE }, (_, row) => (
    Array.from({ length: GRID_SIZE }, (_, col) => Number(board[toIndex(row, col)]) || 0)
  ))
}

function flattenMatrix(matrix) {
  const flattened = []
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      flattened.push(matrix[row][col])
    }
  }
  return flattened
}

function deepCopyMatrix(matrix) {
  return matrix.map(row => [...row])
}

export function isValid(board, row, col, num) {
  if (!Number.isInteger(num) || num < 1 || num > GRID_SIZE) {
    return false
  }

  const matrix = toMatrix(board)

  for (let index = 0; index < GRID_SIZE; index += 1) {
    if (index !== col && matrix[row][index] === num) {
      return false
    }

    if (index !== row && matrix[index][col] === num) {
      return false
    }
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
    for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
      const currentRow = startRow + rowOffset
      const currentCol = startCol + colOffset
      if (currentRow === row && currentCol === col) continue
      if (matrix[currentRow][currentCol] === num) {
        return false
      }
    }
  }

  return true
}

function getCandidates(matrix, row, col) {
  const candidates = []
  for (const number of DIGITS) {
    if (isValid(matrix, row, col, number)) {
      candidates.push(number)
    }
  }
  return candidates
}

function findBestEmptyCell(matrix) {
  let bestRow = -1
  let bestCol = -1
  let bestCandidates = null

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (matrix[row][col]) continue
      const candidates = getCandidates(matrix, row, col)
      if (!bestCandidates || candidates.length < bestCandidates.length) {
        bestRow = row
        bestCol = col
        bestCandidates = candidates
        if (bestCandidates.length <= 1) {
          return {
            row: bestRow,
            col: bestCol,
            candidates: bestCandidates
          }
        }
      }
    }
  }

  return {
    row: bestRow,
    col: bestCol,
    candidates: bestCandidates || []
  }
}

function hasNoDuplicatesMatrix(matrix) {
  const rowSets = Array.from({ length: GRID_SIZE }, () => new Set())
  const colSets = Array.from({ length: GRID_SIZE }, () => new Set())
  const boxSets = Array.from({ length: GRID_SIZE }, () => new Set())

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = Number(matrix[row][col]) || 0
      if (!value) continue
      const box = Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE)
      if (rowSets[row].has(value) || colSets[col].has(value) || boxSets[box].has(value)) {
        return false
      }
      rowSets[row].add(value)
      colSets[col].add(value)
      boxSets[box].add(value)
    }
  }

  return true
}

function isSolvedMatrixValid(matrix) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = matrix[row][col]
      if (!Number.isInteger(value) || value < 1 || value > GRID_SIZE) {
        return false
      }
    }
  }
  return hasNoDuplicatesMatrix(matrix)
}

function solveBacktracking(matrix) {
  const nextCell = findBestEmptyCell(matrix)
  if (nextCell.row === -1) {
    return true
  }

  const numbers = shuffleArray(nextCell.candidates)
  for (const value of numbers) {
    matrix[nextCell.row][nextCell.col] = value
    if (solveBacktracking(matrix)) {
      return true
    }
    matrix[nextCell.row][nextCell.col] = 0
  }

  return false
}

function countSolutionsMatrix(matrix, limit = 2) {
  const nextCell = findBestEmptyCell(matrix)
  if (nextCell.row === -1) {
    return 1
  }

  let solutionCount = 0
  for (const value of nextCell.candidates) {
    matrix[nextCell.row][nextCell.col] = value
    solutionCount += countSolutionsMatrix(matrix, limit)
    matrix[nextCell.row][nextCell.col] = 0
    if (solutionCount >= limit) {
      return solutionCount
    }
  }

  return solutionCount
}

function generateSolvedMatrix() {
  for (let attempt = 0; attempt < MAX_SOLVED_BOARD_ATTEMPTS; attempt += 1) {
    const matrix = createEmptyMatrix()
    if (!solveBacktracking(matrix)) {
      continue
    }
    if (isSolvedMatrixValid(matrix)) {
      return matrix
    }
  }

  throw new Error('Failed to generate a valid solved Sudoku board.')
}

export function isValidMove(board, row, col, value) {
  return isValid(board, row, col, value)
}

export function isValidPlacement(board, index, value) {
  if (!value || value < 1 || value > 9) {
    return true
  }

  const row = Math.floor(index / GRID_SIZE)
  const col = index % GRID_SIZE
  return isValid(board, row, col, value)
}

export function hasNoConflicts(board) {
  if (!Array.isArray(board) || board.length !== TOTAL_CELLS) {
    return false
  }
  return hasNoDuplicatesMatrix(toMatrix(board))
}

function isSolvedBoardValid(board) {
  if (!Array.isArray(board) || board.length !== TOTAL_CELLS) {
    return false
  }
  return isSolvedMatrixValid(toMatrix(board))
}

export function generateSolvedBoard() {
  return flattenMatrix(generateSolvedMatrix())
}

function getGivenRange(level) {
  switch (String(level).toLowerCase()) {
    case 'easy':
      return [30, 35]
    case 'hard':
      return [22, 27]
    case 'medium':
    default:
      return [26, 31]
  }
}

function isClueCountInRange(board, difficulty) {
  const [minGivens, maxGivens] = getGivenRange(difficulty)
  const givens = board.filter(value => value > 0).length
  return givens >= minGivens && givens <= maxGivens
}

export function validateGeneratedPuzzle(gameBoard, solutionBoard, difficulty = 'medium') {
  const normalizedDifficulty = String(difficulty).toLowerCase()

  if (!Array.isArray(gameBoard) || gameBoard.length !== TOTAL_CELLS) {
    return false
  }

  if (!Array.isArray(solutionBoard) || solutionBoard.length !== TOTAL_CELLS) {
    return false
  }

  if (!gameBoard.every(value => Number.isInteger(value) && value >= 0 && value <= GRID_SIZE)) {
    return false
  }

  if (!isSolvedBoardValid(solutionBoard)) {
    return false
  }

  if (!hasNoDuplicatesMatrix(toMatrix(gameBoard))) {
    return false
  }

  if (!isClueCountInRange(gameBoard, normalizedDifficulty)) {
    return false
  }

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const value = gameBoard[index]
    if (value && value !== solutionBoard[index]) {
      return false
    }
  }

  return countSolutionsMatrix(toMatrix(gameBoard), 2) === 1
}

export function createPuzzle(difficulty = 'medium') {
  const normalizedDifficulty = String(difficulty).toLowerCase()
  const [minGivens, maxGivens] = getGivenRange(normalizedDifficulty)

  for (let attempt = 0; attempt < MAX_PUZZLE_ATTEMPTS; attempt += 1) {
    const solutionMatrix = generateSolvedMatrix()
    if (!isSolvedMatrixValid(solutionMatrix)) {
      continue
    }

    // Deep copy puzzle board so solved board is never mutated while removing clues.
    const puzzleMatrix = solutionMatrix.map(row => [...row])
    const targetGivens = randomInt(minGivens, maxGivens)
    const targetRemovals = TOTAL_CELLS - targetGivens
    const positions = shuffleArray(Array.from({ length: TOTAL_CELLS }, (_, index) => index))
    let removed = 0

    for (const position of positions) {
      if (removed >= targetRemovals) break

      const row = Math.floor(position / GRID_SIZE)
      const col = position % GRID_SIZE
      const snapshot = puzzleMatrix[row][col]
      puzzleMatrix[row][col] = 0

      if (countSolutionsMatrix(deepCopyMatrix(puzzleMatrix), 2) !== 1) {
        puzzleMatrix[row][col] = snapshot
        continue
      }

      removed += 1
    }

    if (removed !== targetRemovals) {
      continue
    }

    const solutionBoard = flattenMatrix(solutionMatrix)
    const gameBoard = flattenMatrix(puzzleMatrix)
    const candidate = {
      gameBoard,
      solutionBoard,
      difficulty: normalizedDifficulty,
      removedCells: removed
    }

    if (validateGeneratedPuzzle(candidate.gameBoard, candidate.solutionBoard, normalizedDifficulty)) {
      return candidate
    }
  }

  throw new Error('Failed to create a valid unique Sudoku puzzle after several attempts.')
}

export function generatePuzzle(level = 'medium') {
  return createPuzzle(level)
}

export function validateBoard(board) {
  const errors = new Set()
  const filledBoard = board.map(cell => (cell === '' ? 0 : Number(cell)))

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const value = filledBoard[index]
    if (!value) continue
    if (!isValidPlacement(filledBoard, index, value)) {
      errors.add(index)
    }
  }

  return {
    complete: filledBoard.every(value => value > 0),
    errors: Array.from(errors)
  }
}

export function formatValue(value, theme, fruitIcons, colorLabels) {
  if (!value) {
    return ''
  }
  if (theme === 'fruit') {
    return fruitIcons[value - 1] || String(value)
  }
  if (theme === 'color') {
    return colorLabels[value - 1] || String(value)
  }
  // Animal theme - consolidated to single theme
  const animalEmojis = ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🦖', '🐥', '🐹']
  if (theme === 'animal') {
    return animalEmojis[value - 1] || String(value)
  }
  return String(value)
}

export function copyBoard(board) {
  return board.map(value => (Array.isArray(value) ? [...value] : value))
}
