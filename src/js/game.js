import { levels, regions, themes, achievements, getLevelById, getRegionById, getNextLevelId, getThemeData, levelOrder } from './data.js'
import { isValidPlacement, validateBoard, formatValue, copyBoard } from './sudoku.js'
import { calculateStars, coinsForStars, checkAchievementProgress, clamp } from './rewards.js'
import { loadProgress, saveProgress } from './storage.js'

const app = document.querySelector('#app')
const logoUrl = new URL('../assets/logo.png', import.meta.url).href
const soundUrl = new URL('../assets/sounds/soundefek.mp3', import.meta.url).href

const fruitIcons = ['??', '??', '??', '??', '??', '??', '??', '??', '??']
const colorLabels = ['🔴','🟢','🔵','🟡','🟣','🟠','🩷','🤎','⚫']

const savedProgress = loadProgress()
const state = {
  screen: 'splash',
  theme: savedProgress.theme,
  mode: savedProgress.mode,
  coins: savedProgress.coins,
  unlockedLevels: new Set(savedProgress.unlockedLevels),
  levelStars: { ...savedProgress.levelStars },
  achievements: new Set(savedProgress.achievements),
  stats: { ...savedProgress.stats },
  selectedRegion: 'desert',
  selectedLevel: 'desert-1',
  board: [],
  solution: [],
  fixed: [],
  history: [],
  errors: [],
  timeSeconds: 0,
  timerId: null,
  lives: 3,
  mistakes: 0,
  hintCount: 0,
  pencilMode: false,
  selectedCell: null,
  message: 'Selamat datang! Pilih mode dan mulai petualangan Sudoku.',
  soundEnabled: true
}

function initGame() {
  app.addEventListener('click', handleAppClick)
  app.addEventListener('input', handleAppInput)
  render()
}

function saveGame() {
  saveProgress({
    coins: state.coins,
    theme: state.theme,
    mode: state.mode,
    unlockedLevels: [...state.unlockedLevels],
    levelStars: state.levelStars,
    achievements: [...state.achievements],
    stats: state.stats
  })
}

function playSound(name) {
  if (!state.soundEnabled) return
  const audio = new Audio(soundUrl)
  audio.volume = 0.24
  switch (name) {
    case 'click':
      audio.playbackRate = 0.9
      break
    case 'success':
      audio.playbackRate = 1.1
      break
    case 'wrong':
      audio.playbackRate = 0.7
      break
    case 'hint':
      audio.playbackRate = 1.2
      break
    case 'unlock':
      audio.playbackRate = 1.3
      break
    default:
      audio.playbackRate = 1
  }
  audio.play().catch(() => {})
}

function handleAppInput(event) {
  const input = event.target
  if (!input.classList.contains('cell-input')) {
    return
  }
  const index = Number(input.dataset.index)
  const value = Number(input.value || 0)
  if (Number.isNaN(value) || value < 0 || value > 9) {
    render()
    return
  }
  setBoardValue(index, value)
}

function handleAppClick(event) {
  const action = event.target.dataset.action || event.target.closest('[data-action]')?.dataset.action
  if (!action) return

  const payload = event.target.dataset.value || event.target.dataset.level || event.target.dataset.theme || event.target.dataset.region

  if (action === 'start') {
    playSound('click')
    changeScreen('menu')
    return
  }

  if (action.startsWith('goto:')) {
    playSound('click')
    const screen = action.replace('goto:', '')
    changeScreen(screen)
    return
  }

  if (action === 'select-region') {
    state.selectedRegion = payload
    state.selectedLevel = getRegionById(payload).levels[0]
    changeScreen('story')
    return
  }

  if (action === 'select-level') {
    if (!isLevelUnlocked(payload)) return
    state.selectedLevel = payload
    loadLevel(payload)
    changeScreen('game')
    return
  }

  if (action === 'play-level') {
    const target = payload || state.selectedLevel
    if (!isLevelUnlocked(target)) return
    state.selectedLevel = target
    loadLevel(target)
    changeScreen('game')
    return
  }

  if (action === 'toggle-pencil') {
    state.pencilMode = !state.pencilMode
    playSound('click')
    render()
    return
  }

  if (action === 'hint') {
    applyHint()
    return
  }

  if (action === 'undo') {
    undoMove()
    return
  }

  if (action === 'clear-cell') {
    clearCell()
    return
  }

  if (action === 'number') {
    const value = Number(payload)
    fillSelectedCell(value)
    return
  }

  if (action === 'change-theme') {
    state.theme = payload
    saveGame()
    render()
    return
  }

  if (action === 'sound-toggle') {
    state.soundEnabled = !state.soundEnabled
    render()
    return
  }

  if (action === 'reset-progress') {
    window.localStorage.removeItem('sudoku-adventure-smart-quest-save')
    window.location.reload()
    return
  }
}

function changeScreen(screen) {
  state.screen = screen
  render()
}

function isLevelUnlocked(levelId) {
  return state.unlockedLevels.has(levelId)
}

function loadLevel(levelId) {
  const level = getLevelById(levelId)
  if (!level) return
  state.selectedLevel = levelId
  state.board = [...level.puzzle]
  state.solution = [...level.solution]
  state.fixed = level.puzzle.map(value => value > 0)
  state.history = []
  state.errors = []
  state.timeSeconds = 0
  state.mistakes = 0
  state.hintCount = 0
  state.pencilMode = false
  state.selectedCell = null
  state.message = 'Isi semua kotak dengan angka benar. Kamu bisa lakukan ini!'
  startTimer()
}

function startTimer() {
  stopTimer()
  state.timerId = window.setInterval(() => {
    state.timeSeconds += 1
    const timer = document.querySelector('.timer-value')
    if (timer) timer.textContent = formatTime(state.timeSeconds)
  }, 1000)
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId)
    state.timerId = null
  }
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remaining = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remaining}`
}

function setBoardValue(index, value) {
  if (state.fixed[index]) {
    return
  }
  state.history.push({ board: [...state.board], selectedCell: state.selectedCell })
  state.selectedCell = index
  state.board[index] = value
  state.errors = validateBoard(state.board).errors
  if (value > 0 && !isValidPlacement(state.board, index, value)) {
    state.mistakes += 1
    playSound('wrong')
    state.message = 'Ups! Ada yang tidak cocok, coba lagi.'
  } else {
    playSound('click')
    state.message = 'Teruskan! Kamu semakin dekat.'
  }
  if (state.board.every(value => value > 0) && state.errors.length === 0) {
    completeLevel()
  }
  render()
}

function fillSelectedCell(value) {
  if (state.selectedCell === null) {
    state.message = 'Pilih satu kotak terlebih dahulu.'
    render()
    return
  }
  setBoardValue(state.selectedCell, value)
}

function clearCell() {
  if (state.selectedCell === null) {
    return
  }
  if (state.fixed[state.selectedCell]) {
    return
  }
  state.board[state.selectedCell] = 0
  state.message = 'Kotak dikosongkan. Isi lagi dengan tenang.'
  render()
}

function undoMove() {
  if (!state.history.length) {
    state.message = 'Tidak ada langkah untuk dibatalkan.'
    render()
    return
  }
  const last = state.history.pop()
  state.board = [...last.board]
  state.selectedCell = last.selectedCell
  state.errors = validateBoard(state.board).errors
  playSound('click')
  render()
}

function applyHint() {
  const level = getLevelById(state.selectedLevel)
  if (!level) return
  const emptyIndexes = state.board.reduce((list, value, index) => {
    if (value === 0) list.push(index)
    return list
  }, [])
  if (!emptyIndexes.length) {
    state.message = 'Semua kotak sudah terisi.'
    render()
    return
  }
  const index = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)]
  state.board[index] = state.solution[index]
  state.errors = validateBoard(state.board).errors
  state.hintCount += 1
  state.message = 'Hint diberikan. Coba lihat pola yang muncul.'
  playSound('hint')
  saveGame()
  render()
}

function unlockNextLevel(currentLevel) {
  const nextId = getNextLevelId(currentLevel)
  if (nextId && !state.unlockedLevels.has(nextId)) {
    state.unlockedLevels.add(nextId)
    playSound('unlock')
  }
}

function completeLevel() {
  stopTimer()
  const stars = calculateStars(state.timeSeconds, state.mistakes)
  const reward = coinsForStars(stars)
  const currentStars = state.levelStars[state.selectedLevel] || 0
  state.levelStars[state.selectedLevel] = Math.max(currentStars, stars)
  state.coins += reward
  state.stats.played += 1
  state.stats.completedLevels += 1
  state.stats.totalPlaytime += state.timeSeconds
  if (!state.stats.bestTime || state.timeSeconds < state.stats.bestTime) {
    state.stats.bestTime = state.timeSeconds
  }
  state.stats.accuracy = Math.round(((81 - state.mistakes) / 81) * 100)
  const achieved = checkAchievementProgress(state, {
    timeSeconds: state.timeSeconds,
    mistakes: state.mistakes,
    hintCount: state.hintCount,
    stars
  })
  achieved.forEach(id => state.achievements.add(id))
  unlockNextLevel(state.selectedLevel)
  saveGame()
  state.message = `Level selesai! Kamu mendapat ${stars} bintang dan ${reward} koin.`
  changeScreen('result')
}

function getScreenHTML() {
  switch (state.screen) {
    case 'menu':
      return renderMenuScreen()
    case 'story':
      return renderStoryScreen()
    case 'challenge':
      return renderChallengeScreen()
    case 'game':
      return renderGameScreen()
    case 'result':
      return renderResultScreen()
    case 'achievement':
      return renderAchievementScreen()
    case 'stats':
      return renderStatsScreen()
    case 'profile':
      return renderProfileScreen()
    case 'settings':
      return renderSettingsScreen()
    case 'themes':
      return renderThemeScreen()
    default:
      return renderSplashScreen()
  }
}

function render() {
  app.innerHTML = getScreenHTML()
}

function renderSplashScreen() {
  return `
    <div class="page splash-page">
      <section class="hero-card">
        <img class="game-logo" src="${logoUrl}" alt="Sudoku Adventure logo" />
        <div class="hero-copy">
          <p class="eyebrow">Sudoku Adventure</p>
          <h1>Smart Quest</h1>
          <p>Masuki dunia puzzle cozy dengan dinosaurus lucu, area eksotis, dan tantangan angka.</p>
        </div>
        <div class="hero-actions">
          <button class="button primary" data-action="start">Mulai Petualangan</button>
          <button class="button secondary" data-action="goto:settings">Pengaturan</button>
        </div>
      </section>
    </div>
  `
}

function renderMenuScreen() {
  return `
    <div class="page">
      <section class="panel top-panel">
        <div>
          <p class="eyebrow">Halo, Petualang!</p>
          <h2>Menu Utama</h2>
          <p>Temukan level baru, pilih mode kamu, dan kumpulkan bintang.</p>
        </div>
        <div class="status-chip">
          <span>?? ${state.coins}</span>
          <small>Koin</small>
        </div>
      </section>

      <section class="panel card-grid">
        ${renderMenuButton('Home', 'goto:menu')}
        ${renderMenuButton('Story Mode', 'goto:story')}
        ${renderMenuButton('Challenge Mode', 'goto:challenge')}
        ${renderMenuButton('Achievement', 'goto:achievement')}
        ${renderMenuButton('Statistics', 'goto:stats')}
        ${renderMenuButton('Profile', 'goto:profile')}
      </section>

      <section class="panel quick-actions">
        <div>
          <h3>Mode Saat Ini</h3>
          <p>${state.mode === 'story' ? 'Story Mode' : 'Challenge Mode'}</p>
        </div>
        <div>
          <h3>Theme</h3>
          <p>${getThemeData(state.theme).label}</p>
        </div>
      </section>
    </div>
  `
}

function renderMenuButton(label, action) {
  return `<button class="button block" data-action="${action}">${label}</button>`
}

function renderStoryScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Story Mode</p>
          <h2>Peta Petualangan</h2>
        </div>
      </section>
      <section class="region-list">
        ${regions.map(region => renderRegionCard(region)).join('')}
      </section>
    </div>
  `
}

function renderRegionCard(region) {
  return `
    <article class="region-card" data-action="select-region" data-region="${region.id}">
      <div class="region-icon">${region.icon}</div>
      <div>
        <h3>${region.title}</h3>
        <p>${region.subtitle}</p>
      </div>
      <span class="pill">${region.levels.length} Level</span>
    </article>
  `
}

function renderChallengeScreen() {
  const unlockedLevels = levels.filter(level => isLevelUnlocked(level.id))
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Challenge Mode</p>
          <h2>Uji Kecepatanmu</h2>
        </div>
      </section>
      <section class="panel">
        <p>Challenge mode menggunakan level terpilih yang sudah terbuka. Selamatkan dunia dengan logika cepat.</p>
      </section>
      <section class="level-grid">
        ${unlockedLevels.map(level => renderLevelTile(level)).join('')}
      </section>
    </div>
  `
}

function renderLevelTile(level) {
  const unlocked = isLevelUnlocked(level.id)
  const stars = state.levelStars[level.id] || 0
  return `
    <article class="level-card ${unlocked ? '' : 'locked'}" data-action="select-level" data-level="${level.id}">
      <div class="level-meta">
        <span class="level-icon">${level.icon}</span>
        <div>
          <h3>${level.title}</h3>
          <p>${level.description}</p>
        </div>
      </div>
      <div class="level-status">
        <span class="star-label">${'?'.repeat(stars)}${'?'.repeat(3 - stars)}</span>
        <span class="pill ${unlocked ? 'green' : 'muted'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
    </article>
  `
}

function renderGameScreen() {
  const level = getLevelById(state.selectedLevel)
  if (!level) return renderMenuScreen()
  const activeTheme = getThemeData(state.theme)
  return `
    <div class="page">
      <section class="panel game-header">
        <button class="icon-action" data-action="goto:story">?</button>
        <div>
          <p class="eyebrow">${level.title}</p>
          <h2>${level.description}</h2>
        </div>
        <div class="tag">${activeTheme.icon} ${activeTheme.label}</div>
      </section>

      <section class="panel status-row">
        <div>
          <span class="tiny-label">Lives</span>
          <strong>${'??'.repeat(state.lives)}</strong>
        </div>
        <div>
          <span class="tiny-label">Timer</span>
          <strong class="timer-value">${formatTime(state.timeSeconds)}</strong>
        </div>
        <div>
          <span class="tiny-label">Coins</span>
          <strong>${state.coins}</strong>
        </div>
      </section>

      <section class="panel board-panel">
        ${renderSudokuBoard()}
      </section>

      <section class="panel action-row">
        <button class="button outline" data-action="toggle-pencil">${state.pencilMode ? 'Pencil On' : 'Pencil Off'}</button>
        <button class="button outline" data-action="hint">Hint</button>
        <button class="button outline" data-action="undo">Undo</button>
        <button class="button outline" data-action="clear-cell">Clear</button>
      </section>

      <section class="panel number-row">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => `
          <button class="button mini" data-action="number" data-value="${number}">${formatValue(number, state.theme, fruitIcons, colorLabels)}</button>
        `).join('')}
      </section>

      <section class="panel message-panel">
        <p>${state.message}</p>
      </section>
    </div>
  `
}

function renderSudokuBoard() {
  const errors = new Set(state.errors)
  return `
    <div class="board-grid">
      ${state.board.map((value, index) => {
        const active = state.selectedCell === index ? 'selected' : ''
        const fixed = state.fixed[index] ? 'fixed' : ''
        const invalid = errors.has(index) ? 'invalid' : ''
        const display = formatValue(value, state.theme, fruitIcons, colorLabels)
        return `
          <div class="cell ${active} ${fixed} ${invalid}" data-action="select-cell" data-value="${index}">
            <input
              class="cell-input"
              data-index="${index}"
              value="${value > 0 ? display : ''}"
              ${fixed ? 'readonly' : ''}
              placeholder="${fixed ? '' : '.'}" />
          </div>
        `
      }).join('')}
    </div>
  `
}

function renderResultScreen() {
  const stars = state.levelStars[state.selectedLevel] || 0
  return `
    <div class="page">
      <section class="panel result-card">
        <div class="result-stars">${'?'.repeat(stars)}${'?'.repeat(3 - stars)}</div>
        <h2>Level Selesai!</h2>
        <p>${state.message}</p>
        <div class="result-info">
          <div><span>Waktu</span><strong>${formatTime(state.timeSeconds)}</strong></div>
          <div><span>Kesalahan</span><strong>${state.mistakes}</strong></div>
          <div><span>Hint</span><strong>${state.hintCount}</strong></div>
        </div>
        <div class="button-grid">
          <button class="button primary" data-action="goto:story">Kembali ke Peta</button>
          <button class="button secondary" data-action="play-level" data-level="${state.selectedLevel}">Main Lagi</button>
        </div>
      </section>
    </div>
  `
}

function renderAchievementScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Achievement</p>
          <h2>Badge Koleksi</h2>
        </div>
      </section>
      <section class="achievement-grid">
        ${achievements.map(achievement => {
          const unlocked = state.achievements.has(achievement.id)
          return `
            <article class="achievement-card ${unlocked ? 'active' : 'locked'}">
              <h3>${achievement.title}</h3>
              <p>${achievement.description}</p>
              <span class="pill ${unlocked ? 'green' : 'muted'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
            </article>
          `
        }).join('')}
      </section>
    </div>
  `
}

function renderStatsScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Statistics</p>
          <h2>Ringkasan Gameplay</h2>
        </div>
      </section>
      <section class="stat-grid">
        ${renderStatItem('Total Game', state.stats.played)}
        ${renderStatItem('Best Time', state.stats.bestTime ? formatTime(state.stats.bestTime) : '-:-')}
        ${renderStatItem('Accuracy', `${state.stats.accuracy}%`)}
        ${renderStatItem('Playtime', `${Math.floor(state.stats.totalPlaytime / 60)}m`)}
        ${renderStatItem('Level Selesai', state.stats.completedLevels)}
      </section>
    </div>
  `
}

function renderStatItem(title, value) {
  return `
    <article class="stat-card">
      <span>${title}</span>
      <strong>${value}</strong>
    </article>
  `
}

function renderProfileScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Profile</p>
          <h2>Dino & Kamu</h2>
        </div>
      </section>
      <section class="profile-card">
        <div class="profile-avatar">??</div>
        <div>
          <h3>Petualang Puzzle</h3>
          <p>Theme: ${getThemeData(state.theme).label}</p>
          <p>Mode: ${state.mode === 'story' ? 'Story' : 'Challenge'}</p>
        </div>
      </section>
      <section class="panel profile-stats">
        <div><span>Coins</span><strong>${state.coins}</strong></div>
        <div><span>Unlocked Level</span><strong>${state.unlockedLevels.size}</strong></div>
        <div><span>Achievements</span><strong>${state.achievements.size}</strong></div>
      </section>
    </div>
  `
}

function renderSettingsScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:menu">?</button>
        <div>
          <p class="eyebrow">Pengaturan</p>
          <h2>Atur pengalamanmu</h2>
        </div>
      </section>
      <section class="panel setting-row">
        <div>
          <h3>Sound</h3>
          <p>Hidupkan atau matikan efek suara.</p>
        </div>
        <button class="button outline" data-action="sound-toggle">${state.soundEnabled ? 'Mati' : 'Hidupkan'}</button>
      </section>
      <section class="panel setting-row">
        <div>
          <h3>Theme</h3>
          <p>Pilih tampilan warna yang kamu suka.</p>
        </div>
        <button class="button outline" data-action="goto:themes">Pilih Theme</button>
      </section>
      <section class="panel setting-row">
        <div>
          <h3>Reset Progress</h3>
          <p>Kembalikan semua data ke awal.</p>
        </div>
        <button class="button secondary" data-action="reset-progress">Reset</button>
      </section>
    </div>
  `
}

function renderThemeScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto:settings">?</button>
        <div>
          <p class="eyebrow">Theme Mode</p>
          <h2>Pilih gaya visual</h2>
        </div>
      </section>
      <section class="theme-grid">
        ${themes.map(theme => `
          <article class="theme-card ${state.theme === theme.id ? 'active' : ''}">
            <div>
              <span class="theme-icon">${theme.icon}</span>
              <h3>${theme.label}</h3>
              <p>${theme.description}</p>
            </div>
            <button class="button mini" data-action="change-theme" data-theme="${theme.id}">
              ${state.theme === theme.id ? 'Aktif' : 'Pilih'}
            </button>
          </article>
        `).join('')}
      </section>
    </div>
  `
}

function render() {
  app.innerHTML = getScreenHTML()
}

function selectCell(index) {
  if (state.fixed[index]) {
    state.message = 'Tekan angka atau gunakan tombol hint untuk kotak kosong.'
    render()
    return
  }
  state.selectedCell = index
  render()
}

function renderBoardWithSelection(index) {
  selectCell(index)
}

app.addEventListener('click', event => {
  const action = event.target.dataset.action || event.target.closest('[data-action]')?.dataset.action
  if (!action) return
  const value = event.target.dataset.value
  const level = event.target.dataset.level
  const theme = event.target.dataset.theme
  const region = event.target.dataset.region
  if (action === 'select-cell') {
    selectCell(Number(value))
  }
})

function render() {
  app.innerHTML = getScreenHTML()
}

function renderBoard() {
  return ''
}

initGame()
