import { levels, regions, themes, achievements, getLevelById, getRegionById, getNextLevelId, getThemeData } from './data.js'
import { isValidPlacement, validateBoard, formatValue } from './sudoku.js'
import { calculateStars, coinsForStars, checkAchievementProgress } from './rewards.js'
import { loadProgress, saveProgress } from './storage.js'

const app = document.querySelector('#app')
const logoUrl = new URL('../assets/logo.png', import.meta.url).href
const soundUrl = new URL('../assets/sounds/soundefek.mp3', import.meta.url).href
const fruitIcons = ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🥭', '🍒', '🍉']
const colorLabels = ['Merah', 'Hijau', 'Biru', 'Kuning', 'Ungu', 'Oranye', 'Pink', 'Cyan', 'Abu']

const savedProgress = loadProgress()
const state = {
  screen: 'splash',
  theme: savedProgress.theme,
  mode: savedProgress.mode,
  darkMode: savedProgress.darkMode ?? false,
  musicVolume: savedProgress.musicVolume ?? 0.45,
  coins: savedProgress.coins,
  unlockedLevels: new Set(savedProgress.unlockedLevels),
  levelStars: { ...savedProgress.levelStars },
  achievements: new Set(savedProgress.achievements),
  stats: { ...savedProgress.stats },
  selectedRegion: savedProgress.selectedRegion || 'desert',
  selectedLevel: savedProgress.selectedLevel || 'desert-1',
  username: savedProgress.username,
  loggedIn: savedProgress.loggedIn ?? false,
  profileNameDraft: savedProgress.username,
  loginDraft: '',
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
  soundEnabled: savedProgress.soundEnabled ?? true
}

export function initGame() {
  app.addEventListener('click', handleAppClick)
  app.addEventListener('input', handleAppInput)
  render()
}

function saveGame() {
  saveProgress({
    coins: state.coins,
    theme: state.theme,
    mode: state.mode,
    darkMode: state.darkMode,
    musicVolume: state.musicVolume,
    soundEnabled: state.soundEnabled,
    username: state.username,
    loggedIn: state.loggedIn,
    unlockedLevels: [...state.unlockedLevels],
    levelStars: state.levelStars,
    achievements: [...state.achievements],
    stats: state.stats,
    selectedRegion: state.selectedRegion,
    selectedLevel: state.selectedLevel
  })
}

function playSound(name) {
  if (!state.soundEnabled) return
  const sound = new Audio(soundUrl)
  sound.volume = 0.18
  switch (name) {
    case 'click':
      sound.playbackRate = 0.95
      break
    case 'success':
      sound.playbackRate = 1.1
      break
    case 'wrong':
      sound.playbackRate = 0.8
      break
    case 'hint':
      sound.playbackRate = 1.2
      break
    case 'unlock':
      sound.playbackRate = 1.25
      break
    default:
      sound.playbackRate = 1
  }
  sound.play().catch(() => {})
}

function handleAppInput(event) {
  const input = event.target
  if (input.classList.contains('cell-input')) {
    const index = Number(input.dataset.index)
    const value = Number(input.value || 0)
    if (Number.isNaN(value) || value < 0 || value > 9) {
      render()
      return
    }
    setBoardValue(index, value)
    return
  }

  if (input.dataset.action === 'profile-name') {
    state.profileNameDraft = input.value
  }

  if (input.dataset.action === 'login-input') {
    state.loginDraft = input.value
  }

  if (input.dataset.action === 'music-volume') {
    state.musicVolume = Number(input.value)
    saveGame()
    render()
  }
}

function handleAppClick(event) {
  const target = event.target.closest('[data-action]')
  if (!target) return

  const action = target.dataset.action
  const value = target.dataset.value
  const level = target.dataset.level
  const theme = target.dataset.theme
  const region = target.dataset.region

  switch (action) {
    case 'start':
      playSound('click')
      changeScreen('menu')
      break
    case 'goto':
      playSound('click')
      changeScreen(value)
      break
    case 'select-region':
      if (region) {
        state.selectedRegion = region
        const regionLevels = getRegionById(region)?.levels || []
        state.selectedLevel = regionLevels.find(id => isLevelUnlocked(id)) || regionLevels[0] || state.selectedLevel
        changeScreen('region-map')
      }
      break
    case 'select-level':
      if (level && isLevelUnlocked(level)) {
        state.selectedLevel = level
        loadLevel(level)
        changeScreen('game')
      }
      break
    case 'play-level':
      if (level && isLevelUnlocked(level)) {
        state.selectedLevel = level
        loadLevel(level)
        changeScreen('game')
      }
      break
    case 'toggle-pencil':
      state.pencilMode = !state.pencilMode
      playSound('click')
      render()
      break
    case 'hint':
      applyHint()
      break
    case 'undo':
      undoMove()
      break
    case 'clear-cell':
      clearCell()
      break
    case 'number':
      fillSelectedCell(Number(value))
      break
    case 'change-theme':
      if (theme) {
        state.theme = theme
        saveGame()
        render()
      }
      break
    case 'sound-toggle':
      state.soundEnabled = !state.soundEnabled
      saveGame()
      render()
      break
    case 'toggle-dark':
      state.darkMode = !state.darkMode
      saveGame()
      render()
      break
    case 'edit-profile':
      state.editingProfile = true
      state.profileNameDraft = state.username
      render()
      break
    case 'save-profile':
      if (state.profileNameDraft.trim()) {
        state.username = state.profileNameDraft.trim()
        state.editingProfile = false
        saveGame()
      }
      render()
      break
    case 'cancel-profile':
      state.editingProfile = false
      render()
      break
    case 'logout':
      state.loggedIn = false
      saveGame()
      changeScreen('login')
      break
    case 'login':
      if (state.loginDraft.trim()) {
        state.username = state.loginDraft.trim()
        state.loggedIn = true
        state.loginDraft = ''
        saveGame()
        changeScreen('menu')
      }
      render()
      break
    case 'reset-progress':
      if (window.confirm('Reset semua progress dan mulai dari awal?')) {
        window.localStorage.removeItem('sudoku-adventure-smart-quest-save')
        window.location.reload()
      }
      break
    case 'select-cell':
      selectCell(Number(value))
      break
    default:
      break
  }
}

function changeScreen(screen) {
  state.screen = screen
  render()
}

function isLevelUnlocked(levelId) {
  return state.unlockedLevels.has(levelId)
}

function getTotalCompletion() {
  const finished = Object.values(state.levelStars).filter(stars => stars > 0).length
  const total = levels.length
  return total ? Math.round((finished / total) * 100) : 0
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
  state.message = 'Isi semua kotak dengan angka yang cocok. Kamu bisa!' 
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
  if (state.fixed[index]) return
  state.history.push({ board: [...state.board], selectedCell: state.selectedCell })
  state.selectedCell = index
  state.board[index] = value
  state.errors = validateBoard(state.board).errors

  if (value > 0 && !isValidPlacement(state.board, index, value)) {
    state.mistakes += 1
    playSound('wrong')
    state.message = 'Ups! Ada yang tidak cocok, coba lagi.'
  } else {
    state.message = 'Bagus! Terus isi dengan percaya diri.'
    playSound('click')
  }

  if (state.board.every(value => value > 0) && state.errors.length === 0) {
    completeLevel()
  }

  render()
}

function fillSelectedCell(value) {
  if (state.selectedCell === null) {
    state.message = 'Pilih kotak terlebih dahulu.'
    render()
    return
  }
  setBoardValue(state.selectedCell, value)
}

function clearCell() {
  if (state.selectedCell === null) return
  if (state.fixed[state.selectedCell]) return
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
  const emptyIndexes = state.board
    .map((value, index) => (value === 0 ? index : -1))
    .filter(index => index >= 0)
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
  const earned = checkAchievementProgress(state, {
    timeSeconds: state.timeSeconds,
    mistakes: state.mistakes,
    hintCount: state.hintCount,
    stars
  })
  earned.forEach(id => state.achievements.add(id))
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
    case 'region-map':
      return renderRegionMapScreen()
    case 'challenge':
      return renderChallengeScreen()
    case 'shop':
      return renderShopScreen()
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
    case 'login':
      return renderLoginScreen()
    default:
      return renderSplashScreen()
  }
}

function renderAppShell(content) {
  const showNav = !['splash', 'login'].includes(state.screen)
  return `
    <div class="mobile-shell">
      <div class="mobile-app">
        ${content}
      </div>
      ${showNav ? renderBottomNav() : ''}
    </div>
  `
}

function render() {
  document.body.classList.toggle('dark-mode', state.darkMode)
  app.innerHTML = renderAppShell(getScreenHTML())
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
          <button class="button secondary" data-action="goto" data-value="settings">Pengaturan</button>
        </div>
      </section>
    </div>
  `
}

function renderMenuScreen() {
  const firstLevel = state.selectedLevel || getRegionById(state.selectedRegion)?.levels[0] || 'desert-1'
  return `
    <div class="page home-page">
      <section class="home-hero">
        <div class="home-card-head">
          <div>
            <p class="eyebrow">Sudoku Adventure</p>
            <h1>Halo Petualang!</h1>
          </div>
          <div class="home-mascot">🦖</div>
        </div>

        <div class="home-status-card">
          <div class="status-row">
            <div>
              <span class="status-label">Level</span>
              <strong>Pro Petualang</strong>
            </div>
            <div class="status-pill">+${state.coins}</div>
          </div>

          <div class="xp-row">
            <div class="xp-label">
              <span>XP</span>
              <strong>75%</strong>
            </div>
            <div class="xp-bar">
              <div class="xp-progress" style="width: 75%"></div>
            </div>
          </div>

          <div class="home-hud-row">
            <div class="hud-pill">
              <span>💰</span>
              <div>
                <strong>${state.coins}</strong>
                <small>Koin</small>
              </div>
            </div>
            <div class="hud-pill">
              <span>❤️</span>
              <div>
                <strong>3</strong>
                <small>Lives</small>
              </div>
            </div>
            <div class="hud-pill">
              <span>⭐</span>
              <div>
                <strong>${getTotalCompletion()}%</strong>
                <small>Progress</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel home-actions-card">
        <div class="home-actions-grid">
          ${renderHomeAction('Story', 'story', '🗺️')}
          ${renderHomeAction('Challenge', 'challenge', '⚡')}
          ${renderHomeAction('Achievement', 'achievement', '🏆')}
          ${renderHomeAction('Stats', 'stats', '📊')}
          ${renderHomeAction('Shop', 'shop', '🛍️')}
          ${renderHomeAction('Profile', 'profile', '👤')}
        </div>
      </section>

      <section class="panel home-daily-card">
        <div class="daily-header">
          <div>
            <p class="eyebrow">Daily Reward</p>
            <h3>Claim bonus koin hari ini</h3>
          </div>
          <button class="button mini primary" data-action="play-level" data-level="${firstLevel}">Claim</button>
        </div>
        <div class="daily-bar">
          <span>Task: Selesaikan 1 level</span>
          <strong>+25 Koin</strong>
        </div>
      </section>

      <section class="panel home-hero-info">
        <div class="floating-bubble bubble-one"></div>
        <div class="floating-bubble bubble-two"></div>
        <div class="floating-hero-content">
          <p class="eyebrow">Adventure Map</p>
          <h2>Petualanganmu dimulai sejak sekarang.</h2>
          <p>Kumpulkan Crystal, unlock area baru, dan tingkatkan level Dino-mu.</p>
        </div>
      </section>
    </div>
  `
}

function renderHomeAction(label, screen, icon) {
  return `
    <button class="home-action-button" data-action="goto" data-value="${screen}">
      <span>${icon}</span>
      <strong>${label}</strong>
    </button>
  `
}

function renderQuickAction(label, action, value, icon, subtitle) {
  return `
    <button class="quick-card" data-action="${action}" data-value="${value}" ${action === 'play-level' ? `data-level="${value}"` : ''}>
      <div class="quick-card-icon">${icon}</div>
      <div>
        <strong>${label}</strong>
        <p>${subtitle}</p>
      </div>
    </button>
  `
}

function renderMenuButton(label, screen, icon, subtitle) {
  const description = subtitle ? `<p>${subtitle}</p>` : ''
  return `
    <button class="nav-card" data-action="goto" data-value="${screen}">
      <div class="nav-card-icon">${icon}</div>
      <div class="nav-card-content">
        <strong>${label}</strong>
        ${description}
      </div>
    </button>
  `
}

function renderBottomNav() {
  const navItems = [
    { label: 'Home', screen: 'menu', icon: '🏠' },
    { label: 'Map', screen: 'story', icon: '🗺️' },
    { label: 'Puzzle', screen: 'challenge', icon: '⚡' },
    { label: 'Achievement', screen: 'achievement', icon: '🏆' },
    { label: 'Profile', screen: 'profile', icon: '👤' }
  ]

  return `
    <nav class="bottom-nav">
      ${navItems.map(item => {
        const active = item.screen === 'story'
          ? ['story', 'region-map'].includes(state.screen)
          : state.screen === item.screen
        return `
          <button class="bottom-nav-button ${active ? 'active' : ''}" data-action="goto" data-value="${item.screen}">
            <span>${item.icon}</span>
            <small>${item.label}</small>
          </button>
        `
      }).join('')}
    </nav>
  `
}

function renderShopScreen() {
  return `
    <div class="page shop-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Shop</p>
          <h2>Toko hadiah</h2>
        </div>
      </section>
      <section class="panel shop-grid">
        ${['Mystic Skin', 'Super Hint', 'Heart Pack', 'Crystal Box'].map(item => `
          <article class="shop-card">
            <div class="shop-icon">✨</div>
            <div>
              <strong>${item}</strong>
              <p>Item spesial untuk bantu petualanganmu.</p>
            </div>
            <button class="button mini outline">Buy</button>
          </article>
        `).join('')}
      </section>
    </div>
  `
}

function renderStoryScreen() {
  return `
    <div class="page story-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Story Mode</p>
          <h2>Peta Petualangan</h2>
        </div>
      </section>

      <section class="panel story-intro-card">
        <p>Ikuti jejak Dino kecil dan jelajahi setiap area dengan cerita singkat. Selesaikan tantangan di setiap wilayah untuk membuka kisah baru dan hadiah spesial.</p>
      </section>

      <section class="panel story-map-card">
        <div class="story-map-header">
          <div>
            <p class="eyebrow">Adventure Map</p>
            <h3>Jelajahi area dan buka level baru</h3>
          </div>
          <div class="pill-row">
            <span class="pill green">${state.coins} Koin</span>
            <span class="pill">${getTotalCompletion()}% Progress</span>
          </div>
        </div>

        <div class="story-map">
          ${regions.map((region, index) => renderStoryMapRegion(region, index)).join('')}
        </div>
      </section>

      <section class="panel story-progress-card">
        <h3>Area Terbuka</h3>
        <div class="story-progress-list">
          ${regions.map(region => renderProgressBadge(region)).join('')}
        </div>
      </section>
    </div>
  `
}

function renderStoryMapRegion(region, index) {
  const completed = region.levels.filter(levelId => (state.levelStars[levelId] || 0) > 0).length
  const unlocked = index === 0 || regions[index - 1].levels.some(levelId => (state.levelStars[levelId] || 0) > 0)
  return `
    <button class="story-region-node ${unlocked ? 'active' : 'locked'}" data-action="${unlocked ? 'select-region' : ''}" data-region="${region.id}">
      <div class="region-node-icon">${region.icon}</div>
      <div class="region-node-text">
        <strong>${region.title}</strong>
        <p>${region.story || region.subtitle}</p>
      </div>
      <span class="region-node-meta">${completed}/${region.levels.length} level</span>
    </button>
  `
}

function renderProgressBadge(region) {
  const completed = region.levels.filter(levelId => (state.levelStars[levelId] || 0) > 0).length
  return `
    <button class="progress-badge" type="button" data-action="select-region" data-region="${region.id}">
      <div class="progress-badge-icon">${region.icon}</div>
      <div>
        <strong>${region.title}</strong>
        <p>${region.story || region.subtitle}</p>
      </div>
      <span class="pill green">${completed} / ${region.levels.length} selesai</span>
    </button>
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

function renderRegionMapScreen() {
  const region = getRegionById(state.selectedRegion)
  const regionLevels = region?.levels.map(id => getLevelById(id)) || []
  const completed = regionLevels.filter(level => (state.levelStars[level.id] || 0) > 0).length
  return `
    <div class="page region-map-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="story">←</button>
        <div>
          <p class="eyebrow">Area Map</p>
          <h2>${region.title} Area</h2>
          <p>${region.subtitle}</p>
        </div>
      </section>
      <section class="panel map-screen">
        <div class="map-area-card">
          <div class="map-area-icon">${region.icon}</div>
          <div>
            <h3>${region.title} Area</h3>
            <p>Temukan semua level dan kumpulkan Crystal satu per satu.</p>
            <div class="pill-row">
              <span class="pill green">${completed}/${regionLevels.length} level selesai</span>
              <span class="pill">${getTotalCompletion()}% total progress</span>
            </div>
          </div>
        </div>
        <div class="level-path">
          ${regionLevels.map((level, index) => renderRegionLevelNode(level, index, regionLevels)).join('')}
        </div>
      </section>
    </div>
  `
}

function renderRegionLevelNode(level, index, allLevels) {
  const unlocked = isLevelUnlocked(level.id)
  const stars = state.levelStars[level.id] || 0
  const isCurrent = state.selectedLevel === level.id
  return `
    <button class="map-node ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}" data-action="${unlocked ? 'select-level' : ''}" data-level="${level.id}">
      <div class="map-node-number">${index + 1}</div>
      <div class="map-node-body">
        <strong>${level.title}</strong>
        <p>${stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : 'Locked'}</p>
      </div>
      <span class="pill ${unlocked ? 'green' : 'muted'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
    </button>
  `
}

function renderChallengeScreen() {
  const unlockedLevels = levels.filter(level => isLevelUnlocked(level.id))
  const challengeItems = [
    { title: 'Speed Sprint', subtitle: 'Selesaikan level dengan cepat', icon: '⚡', level: unlockedLevels[0] },
    { title: 'Brain Rush', subtitle: 'Tantangan otak dengan level pilihan', icon: '🧠', level: unlockedLevels[1] || unlockedLevels[0] },
    { title: 'Crystal Quest', subtitle: 'Kumpulkan poin dan bonus', icon: '💎', level: unlockedLevels[2] || unlockedLevels[0] }
  ]

  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Challenge Mode</p>
          <h2>Uji Kecepatanmu</h2>
        </div>
      </section>

      <section class="panel challenge-summary-card">
        <p>Challenge mode menampilkan beberapa tantangan seru. Pilih challenge, lalu mulai main untuk mendapatkan bonus ekstra.</p>
      </section>

      <section class="challenge-grid">
        ${challengeItems.map(item => renderChallengeCard(item)).join('')}
      </section>

      <section class="panel challenge-levels-card">
        <h3>Level Terbuka</h3>
        <div class="level-grid">
          ${unlockedLevels.map(level => renderLevelTile(level)).join('')}
        </div>
      </section>
    </div>
  `
}

function renderChallengeCard(item) {
  const levelId = item.level?.id || levels[0].id
  return `
    <button class="challenge-card" type="button" data-action="play-level" data-level="${levelId}">
      <div class="challenge-card-icon">${item.icon}</div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.subtitle}</p>
      </div>
    </button>
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
          <p class="level-story">${level.story || ''}</p>
        </div>
      </div>
      <div class="level-status">
        <span class="star-label">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
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
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="story">←</button>
        <div>
          <p class="eyebrow">${level.title}</p>
          <h2>${level.description}</h2>
        </div>
        <div class="tag">${activeTheme.icon} ${activeTheme.label}</div>
      </section>

      <section class="panel level-story-card">
        <p>${level.story || level.description}</p>
      </section>

      <section class="panel status-row">
        <div>
          <span class="tiny-label">Lives</span>
          <strong>${'❤️'.repeat(state.lives)}</strong>
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
  const errorSet = new Set(state.errors)
  return `
    <div class="board-grid">
      ${state.board
        .map((value, index) => {
          const active = state.selectedCell === index ? 'selected' : ''
          const fixed = state.fixed[index] ? 'fixed' : ''
          const invalid = errorSet.has(index) ? 'invalid' : ''
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
        })
        .join('')}
    </div>
  `
}

function renderResultScreen() {
  const stars = state.levelStars[state.selectedLevel] || 0
  return `
    <div class="page">
      <section class="panel result-card">
        <div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <h2>Level Selesai!</h2>
        <p>${state.message}</p>
        <div class="result-info">
          <div><span>Waktu</span><strong>${formatTime(state.timeSeconds)}</strong></div>
          <div><span>Kesalahan</span><strong>${state.mistakes}</strong></div>
          <div><span>Hint</span><strong>${state.hintCount}</strong></div>
        </div>
        <div class="button-grid">
          <button class="button primary" data-action="goto" data-value="story">Kembali ke Peta</button>
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
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Achievement</p>
          <h2>Badge Koleksi</h2>
        </div>
      </section>
      <section class="achievement-grid">
        ${achievements
          .map(achievement => {
            const unlocked = state.achievements.has(achievement.id)
            return `
              <article class="achievement-card ${unlocked ? 'active' : 'locked'}">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                <span class="pill ${unlocked ? 'green' : 'muted'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
              </article>
            `
          })
          .join('')}
      </section>
    </div>
  `
}

function renderStatsScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
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
    <div class="page profile-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Profile</p>
          <h2>Dino Adventurer</h2>
        </div>
      </section>
      <section class="panel profile-header-card">
        <div class="profile-avatar-large">🦖</div>
        <div class="profile-summary">
          <strong>${state.username}</strong>
          <p>Petualang Cozy</p>
          <div class="profile-level-chip">Level 12</div>
          <div class="xp-row">
            <span>XP</span>
            <strong>75%</strong>
          </div>
          <div class="xp-bar">
            <div class="xp-progress" style="width: 75%"></div>
          </div>
        </div>
      </section>
      <section class="panel profile-stats-grid">
        ${renderProfileStat('Coins', state.coins, '💰')}
        ${renderProfileStat('Achievements', state.achievements.size, '🏆')}
        ${renderProfileStat('Areas', regions.filter(region => region.levels.some(levelId => state.levelStars[levelId] > 0)).length, '🗺️')}
        ${renderProfileStat('Unlocked', state.unlockedLevels.size, '🔓')}
      </section>
      <section class="panel profile-item-card">
        <div class="item-header">
          <p class="eyebrow">Collection</p>
          <strong>Item favorit</strong>
        </div>
        <div class="item-grid">
          ${['Crystal', 'Magic Leaf', 'Star Badge', 'Puzzle Scroll'].map(item => `
            <div class="collection-item">
              <strong>${item}</strong>
              <span>Owned</span>
            </div>
          `).join('')}
        </div>
      </section>
      <section class="panel profile-action-row">
        <button class="button outline" data-action="edit-profile">Ubah Nama</button>
        <button class="button primary" data-action="goto" data-value="settings">Pengaturan</button>
      </section>
    </div>
  `
}

function renderProfileStat(title, value, icon) {
  return `
    <div class="profile-stat-card">
      <div>${icon}</div>
      <div>
        <span>${title}</span>
        <strong>${value}</strong>
      </div>
    </div>
  `
}

function renderSettingsScreen() {
  return `
    <div class="page settings-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Pengaturan</p>
          <h2>Atur pengalamanmu</h2>
        </div>
      </section>
      <section class="panel settings-grid">
        ${renderSettingCard('Login / Logout', state.loggedIn ? 'Keluar dari akun saat ini.' : 'Masuk untuk menyimpan progressmu.', state.loggedIn ? 'Logout' : 'Login', state.loggedIn ? 'logout' : 'goto', state.loggedIn ? '' : 'login')}
        ${renderSettingCard('Sound', state.soundEnabled ? 'Efek suara aktif.' : 'Suara dimatikan.', state.soundEnabled ? 'Matikan' : 'Hidupkan', 'sound-toggle')}
        ${renderSettingCard('Dark Mode', state.darkMode ? 'Mode gelap aktif.' : 'Mode terang aktif.', state.darkMode ? 'Matikan' : 'Nyalakan', 'toggle-dark')}
      </section>
      <section class="panel range-card">
        <div class="range-header">
          <div>
            <h3>Music Volume</h3>
            <p>Atur tingkat musik latar.</p>
          </div>
          <strong>${Math.round(state.musicVolume * 100)}%</strong>
        </div>
        <input type="range" class="range-input" min="0" max="1" step="0.05" value="${state.musicVolume}" data-action="music-volume" />
      </section>
      <section class="panel setting-row">
        <div>
          <h3>Theme</h3>
          <p>Pilih tampilan warna yang kamu suka.</p>
        </div>
        <button class="button outline" data-action="goto" data-value="themes">Pilih Theme</button>
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

function renderSettingCard(title, description, buttonLabel, action, value = '') {
  return `
    <div class="setting-card">
      <div>
        <strong>${title}</strong>
        <p>${description}</p>
      </div>
      <button class="button mini outline" data-action="${action}" data-value="${value}">${buttonLabel}</button>
    </div>
  `
}

function renderThemeScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="settings">←</button>
        <div>
          <p class="eyebrow">Theme Mode</p>
          <h2>Pilih gaya visual</h2>
        </div>
      </section>
      <section class="theme-grid">
        ${themes
          .map(theme => `
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
          `)
          .join('')}
      </section>
    </div>
  `
}

function renderLoginScreen() {
  return `
    <div class="page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="settings">←</button>
        <div>
          <p class="eyebrow">Login</p>
          <h2>Masuk untuk menyimpan progress</h2>
        </div>
      </section>
      <section class="panel login-card">
        <label class="profile-input-row">
          <span>Nama Player</span>
          <input class="profile-input" data-action="login-input" value="${state.loginDraft}" placeholder="Masukkan nama kamu" />
        </label>
        <button class="button primary" data-action="login">Login</button>
      </section>
    </div>
  `
}

function selectCell(index) {
  if (state.fixed[index]) {
    state.message = 'Pilih kotak kosong untuk mengisi angka.'
    render()
    return
  }
  state.selectedCell = index
  render()
}
