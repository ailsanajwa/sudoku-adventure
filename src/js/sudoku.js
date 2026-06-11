export function isValidPlacement(board, index, value) {
  if (!value || value < 1 || value > 9) {
    return true
  }

  const row = Math.floor(index / 9)
  const col = index % 9
  const blockRow = Math.floor(row / 3) * 3
  const blockCol = Math.floor(col / 3) * 3

  for (let x = 0; x < 9; x += 1) {
    if (x !== col && board[row * 9 + x] === value) {
      return false
    }
    if (x !== row && board[x * 9 + col] === value) {
      return false
    }
  }

  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const currentIndex = (blockRow + r) * 9 + blockCol + c
      if (currentIndex !== index && board[currentIndex] === value) {
        return false
      }
    }
  }

  return true
}

export function validateBoard(board) {
  const errors = new Set()
  const filledBoard = board.map(cell => (cell === '' ? 0 : Number(cell)))

  for (let index = 0; index < 81; index += 1) {
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
  return String(value)
}

export function copyBoard(board) {
  return board.map(value => (Array.isArray(value) ? [...value] : value))
}
