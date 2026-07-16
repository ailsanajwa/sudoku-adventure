import { levels, regions, themes, achievements, getLevelById, getRegionById, getNextLevelId, getThemeData } from './data.js'
import { isValidPlacement, validateBoard, formatValue, generatePuzzle, validateGeneratedPuzzle } from './sudoku.js'
import { calculateStars, coinsForStars, checkAchievementProgress, calculateScore } from './rewards.js'
import { loadProgress, saveProgress } from './storage.js'

const app = document.querySelector('#app')
const logoUrl = new URL('../assets/logo.png', import.meta.url).href
const dinoUrl = new URL('../assets/picture/dino1.jpeg', import.meta.url).href
const soundUrl = new URL('../assets/sounds/soundefek.mp3', import.meta.url).href
const puzzleArtUrl = new URL('../assets/backgroundarea.png', import.meta.url).href
const miniFruitPuzzleUrl = new URL('../assets/images/puzzles/puzzlebuah.png', import.meta.url).href
const fruitPuzzleUrl = new URL('../assets/images/puzzles/puzzlebuah.png', import.meta.url).href
const dinoPuzzleUrl = new URL('../assets/images/puzzles/puzzledino1.png', import.meta.url).href
const dinoPuzzleAltUrl = new URL('../assets/images/puzzles/puzzledino2.png', import.meta.url).href
const desertPuzzleUrl = new URL('../assets/images/areas/desert-ruins.png', import.meta.url).href
const forestPuzzleUrl = new URL('../assets/images/areas/forest-kingdom.png', import.meta.url).href
const mountainPuzzleUrl = new URL('../assets/images/areas/sky-mountain.png', import.meta.url).href
const snowPuzzleUrl = new URL('../assets/images/areas/snow-valley.png', import.meta.url).href
const castlePuzzleUrl = new URL('../assets/images/areas/mystery-castle.png', import.meta.url).href
const puzzleArtThemes = [
  { id: 'classic', label: 'Classic', url: puzzleArtUrl },
  { id: 'fruit', label: 'Buah', url: fruitPuzzleUrl },
  { id: 'dino', label: 'Dino', url: dinoPuzzleUrl },
  { id: 'dino-friends', label: 'Dino 2', url: dinoPuzzleAltUrl },
  { id: 'desert', label: 'Desert', url: desertPuzzleUrl },
  { id: 'forest', label: 'Forest', url: forestPuzzleUrl },
  { id: 'mountain', label: 'Mountain', url: mountainPuzzleUrl },
  { id: 'snow', label: 'Snow', url: snowPuzzleUrl },
  { id: 'castle', label: 'Castle', url: castlePuzzleUrl }
]
const areaNodeImages = {
  desert: new URL('../assets/images/areas/desert-ruins.png', import.meta.url).href,
  forest: new URL('../assets/images/areas/forest-kingdom.png', import.meta.url).href,
  mountain: new URL('../assets/images/areas/sky-mountain.png', import.meta.url).href,
  snow: new URL('../assets/images/areas/snow-valley.png', import.meta.url).href,
  castle: new URL('../assets/images/areas/mystery-castle.png', import.meta.url).href
}

let backgroundMusic = null
let audioGestureUnlocked = false
let splashTimeoutId = null
let puzzleTimerId = null
let puzzleCompleteTimeoutId = null
let hintPatternTimeoutId = null
let moveFeedbackTimeoutId = null
const fruitIcons = ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🥭', '🍒', '🍉']
const colorLabels = ['🔴','🟢','🔵','🟡','🟣','🟠','🩷','🤎','⚫']
const regionStory = {
  desert: { title: 'Mencari Crystal Matahari', crystal: 'Sun Crystal', icon: 'SUN' },
  forest: { title: 'Mencari Crystal Alam', crystal: 'Nature Crystal', icon: 'LEAF' },
  mountain: { title: 'Mencari Crystal Angin', crystal: 'Wind Crystal', icon: 'WIND' },
  snow: { title: 'Mencari Crystal Es', crystal: 'Ice Crystal', icon: 'ICE' },
  castle: { title: 'Mencari Crystal Utama', crystal: 'Main Crystal', icon: 'CORE' }
}
const dinoSkins = [
  { id: 'baby', label: 'Baby Dino', cost: 0 },
  { id: 'explorer', label: 'Explorer Dino', cost: 90 },
  { id: 'forest', label: 'Forest Dino', cost: 130 },
  { id: 'crystal', label: 'Crystal Dino', cost: 180 }
]
const colorThemes = [
  { id: 'purple-pastel', label: 'Ungu Pastel', color: '#b58cff' },
  { id: 'mint-green', label: 'Hijau Mint', color: '#8ff3c4' },
  { id: 'sky-blue', label: 'Biru Langit', color: '#75d0ff' },
  { id: 'sun-yellow', label: 'Kuning Cerah', color: '#ffd166' },
  { id: 'sakura-pink', label: 'Pink Sakura', color: '#ffb7d5' }
]

const animalEmojis = ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🦖', '🐥', '🐹']

const shopItems = [
  { id: 'theme-fruit', type: 'theme', label: 'Fruit Theme', cost: 70, unlock: 'fruit', icon: '🍓', description: 'Angka menjadi buah lucu' },
  { id: 'theme-color', type: 'theme', label: 'Color Theme', cost: 70, unlock: 'color', icon: '🎨', description: 'Angka dengan warna ceria' },
  { id: 'theme-animal', type: 'theme', label: '🐾 Animal Theme', cost: 140, unlock: 'animal', icon: '🐾', description: 'Angka berubah menjadi hewan lucu', emojis: animalEmojis },
  { id: 'bg-forest', type: 'background', label: 'Forest Background', cost: 80, icon: '🌲', description: 'Latar belakang hutan hijau' },
  { id: 'bg-mountain', type: 'background', label: 'Mountain Background', cost: 90, icon: '⛰️', description: 'Latar belakang gunung megah' },
  { id: 'bg-castle', type: 'background', label: 'Castle Background', cost: 110, icon: '🏰', description: 'Latar belakang kastil misteri' },
  { id: 'bg-galaxy', type: 'background', label: 'Galaxy Background', cost: 140, icon: '🌌', description: 'Latar belakang galaksi' },
  { id: 'skin-explorer', type: 'skin', label: 'Explorer Dino', cost: 90, unlock: 'explorer', icon: '🦖', description: 'Dino penjelajah baru' }
]

const dailyRewards = [
  { day: 1, icon: '🪙', reward: '+20 Coin', type: 'coin', amount: 20 },
  { day: 2, icon: '🪙', reward: '+30 Coin', type: 'coin', amount: 30 },
  { day: 3, icon: '💡', reward: '+1 Hint', type: 'hint', amount: 1 },
  { day: 4, icon: '🪙', reward: '+50 Coin', type: 'coin', amount: 50 },
  { day: 5, icon: '✨', reward: 'Theme Fragment', type: 'fragment', amount: 1 },
  { day: 6, icon: '🪙', reward: '+100 Coin', type: 'coin', amount: 100 },
  { day: 7, icon: '🎁', reward: 'Mystery Chest', type: 'chest', amount: 1 }
]
const miniGames = [
  { id: 'dino-chase', title: 'Dino Chase', reward: 'Klik Dino untuk coin bonus.', target: 5 },
  { id: 'crystal-catch', title: 'Crystal Catch', reward: 'Tangkap crystal untuk XP bonus.', target: 5 },
  { id: 'memory-dino', title: 'Memory Dino', reward: 'Cocokkan kartu Dino untuk fragment.', target: 4 },
  { id: 'fruit-puzzle', title: 'Fruit Puzzle', reward: 'Susun puzzle gambar buah untuk bonus besar.', target: 9 }
]
const MAX_HINTS_PER_LEVEL = 5
const regionUnlockRequirement = {
  desert: 0,
  forest: 2,
  mountain: 6,
  snow: 10,
  castle: 15
}
const quizQuestionBank = [
  { question: 'Berapa hasil dari 15 + 7 ?', options: ['20', '21', '22', '24'], answer: '22' },
  { question: 'Berapa hasil dari 36 - 9 ?', options: ['25', '27', '29', '30'], answer: '27' },
  { question: 'Berapa hasil dari 8 x 6 ?', options: ['42', '46', '48', '52'], answer: '48' },
  { question: 'Berapa hasil dari 56 ÷ 8 ?', options: ['6', '7', '8', '9'], answer: '7' },
  { question: 'Bilangan prima mana?', options: ['21', '27', '29', '33'], answer: '29' },
  { question: 'Lanjutkan pola: 2, 4, 8, 16, ...', options: ['18', '24', '30', '32'], answer: '32' },
  { question: 'Akar kuadrat dari 81 adalah ...', options: ['7', '8', '9', '10'], answer: '9' },
  { question: 'Nilai dari 12 + 18 ÷ 3 adalah ...', options: ['10', '16', '18', '20'], answer: '18' },
  { question: 'Keliling persegi sisi 7 adalah ...', options: ['14', '21', '28', '49'], answer: '28' },
  { question: 'Setengah dari 150 adalah ...', options: ['65', '70', '75', '80'], answer: '75' },
  { question: 'Berapa hasil dari 9 x 9 - 10 ?', options: ['69', '71', '73', '75'], answer: '71' },
  { question: 'Hasil 100 - 45 + 5 adalah ...', options: ['55', '60', '65', '70'], answer: '60' }
]

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
  crystals: new Set(savedProgress.crystals || []),
  dino: {
    level: savedProgress.dino?.level || 1,
    xp: savedProgress.dino?.xp || 0,
    skin: savedProgress.dino?.skin || 'baby',
    skins: new Set(savedProgress.dino?.skins || ['baby'])
  },
  collections: {
    backgrounds: new Set(savedProgress.collections?.backgrounds || ['soft-sky']),
    themes: new Set(savedProgress.collections?.themes || ['classic']),
    themeFragments: savedProgress.collections?.themeFragments || 0,
    dailyLoginClaimed: savedProgress.collections?.dailyLoginClaimed || null,
    dailyStreak: savedProgress.collections?.dailyStreak || 0,
    treasureChests: savedProgress.collections?.treasureChests || 0
  },
  stats: { ...savedProgress.stats },
  selectedRegion: savedProgress.selectedRegion || 'desert',
  selectedLevel: savedProgress.selectedLevel || 'desert-1',
  activeGame: savedProgress.activeGame || null,
  username: savedProgress.username,
  loggedIn: savedProgress.loggedIn ?? false,
  editingProfile: false,
  profileNameDraft: savedProgress.username,
  loginDraft: '',
  board: [],
  initialBoard: [],
  solution: [],
  fixed: [],
  history: [],
  errors: [],
  timeSeconds: 0,
  timerId: null,
  lives: 8,
  mistakes: 0,
  hintCount: 0,
  hintPattern: null,
  moveFeedback: null,
  pencilMode: false,
  selectedCell: null,
  message: 'Selamat datang! Pilih mode dan mulai petualangan Sudoku.',
  puzzleTheme: savedProgress.puzzleTheme || 'classic',
  musicEnabled: savedProgress.musicEnabled ?? true,
  soundEnabled: savedProgress.soundEnabled ?? true,
  lastReward: null,
  storyPopup: null,
  shopConfirm: null,
  miniGame: null,
  quizChallenge: null,
  puzzleQuest: null,
  puzzleCompletePopup: null,
  treasurePopup: null,
  showConfetti: false,
  dailyRewardPopup: null
}

export function initGame() {
  app.addEventListener('click', handleAppClick)
  app.addEventListener('input', handleAppInput)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', handlePageHide)
  window.addEventListener('beforeunload', handlePageHide)
  scheduleSplashTransition()
  saveGame(false)
  render()
}

function scheduleSplashTransition() {
  if (splashTimeoutId) {
    window.clearTimeout(splashTimeoutId)
  }
  splashTimeoutId = window.setTimeout(() => {
    splashTimeoutId = null
    if (state.screen !== 'splash') return
    changeScreen(state.loggedIn ? 'menu' : 'login')
  }, 2400)
}

function clearSplashTransition() {
  if (!splashTimeoutId) return
  window.clearTimeout(splashTimeoutId)
  splashTimeoutId = null
}

function saveGame(syncActiveGame = true) {
  if (syncActiveGame) {
    syncActiveGameState()
  }
  saveProgress({
    coins: state.coins,
    theme: state.theme,
    mode: state.mode,
    darkMode: state.darkMode,
    musicVolume: state.musicVolume,
    musicEnabled: state.musicEnabled,
    soundEnabled: state.soundEnabled,
    puzzleTheme: state.puzzleTheme,
    username: state.username,
    loggedIn: state.loggedIn,
    unlockedLevels: [...state.unlockedLevels],
    levelStars: state.levelStars,
    achievements: [...state.achievements],
    crystals: [...state.crystals],
    dino: {
      ...state.dino,
      skins: [...state.dino.skins]
    },
    collections: {
      ...state.collections,
      backgrounds: [...state.collections.backgrounds],
      themes: [...state.collections.themes]
    },
    activeGame: state.activeGame,
    stats: state.stats,
    selectedRegion: state.selectedRegion,
    selectedLevel: state.selectedLevel
  })
}

function ensureBackgroundMusic() {
  if (backgroundMusic) return backgroundMusic
  backgroundMusic = new Audio(soundUrl)
  backgroundMusic.loop = true
  backgroundMusic.preload = 'auto'
  syncBackgroundMusicVolume()
  return backgroundMusic
}

function syncBackgroundMusicVolume() {
  if (!backgroundMusic) return
  backgroundMusic.volume = state.musicEnabled ? state.musicVolume : 0
}

function startBackgroundMusic() {
  if (!state.musicEnabled) return
  const music = ensureBackgroundMusic()
  syncBackgroundMusicVolume()
  music.play().catch(() => {})
}

function stopBackgroundMusic() {
  if (!backgroundMusic) return
  backgroundMusic.pause()
}

function handleVisibilityChange() {
  if (document.hidden) {
    saveGame()
    stopBackgroundMusic()
    return
  }
  if (audioGestureUnlocked) {
    startBackgroundMusic()
  }
}

function handlePageHide() {
  saveGame()
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
    const raw = String(input.value || '').trim()
    if (!raw) {
      setBoardValue(index, 0)
      return
    }
    const digit = raw.match(/[1-9]/)
    const value = digit ? Number(digit[0]) : Number.NaN
    if (Number.isNaN(value) || value < 1 || value > 9) {
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
    syncBackgroundMusicVolume()
    if (audioGestureUnlocked && state.musicVolume > 0) {
      startBackgroundMusic()
    }
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
  const item = target.dataset.item
  const skin = target.dataset.skin
  const mini = target.dataset.mini
  const option = target.dataset.option

  if (!audioGestureUnlocked) {
    audioGestureUnlocked = true
    startBackgroundMusic()
  }

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
        if (!isRegionAccessible(region)) {
          const needed = regionUnlockRequirement[region] || 0
          state.message = `Area masih terkunci. Kumpulkan ${needed} bintang dulu.`
          render()
          break
        }
        const selectedRegionData = getRegionById(region)
        if (selectedRegionData && !selectedRegionData.levels.some(levelId => isLevelUnlocked(levelId))) {
          state.unlockedLevels.add(selectedRegionData.levels[0])
        }
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
    case 'reset-level':
      resetLevel()
      break
    case 'number':
      fillSelectedCell(Number(value))
      break
    case 'check-level':
    case 'check-board': {
      checkBoardState()
      break
    }
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
    case 'music-toggle':
      state.musicEnabled = !state.musicEnabled
      if (!state.musicEnabled) {
        stopBackgroundMusic()
      } else if (audioGestureUnlocked) {
        startBackgroundMusic()
      }
      syncBackgroundMusicVolume()
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
      } else {
        state.message = 'Masukkan nama dulu untuk login.'
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
    case 'claim-daily':
      claimDailyReward()
      break
    case 'close-daily-popup':
      state.dailyRewardPopup = null
      render()
      break
    case 'buy-item':
      promptBuyItem(item)
      break
    case 'confirm-buy':
      if (state.shopConfirm) {
        buyShopItem(state.shopConfirm.id)
        state.shopConfirm = null
      }
      break
    case 'cancel-buy':
      state.shopConfirm = null
      render()
      break
    case 'select-skin':
      selectDinoSkin(skin)
      break
    case 'close-popup':
      state.storyPopup = null
      render()
      break
    case 'open-achievement':
      state.message = value ? `Badge ${value} dibuka di Achievement Room.` : 'Badge masih terkunci.'
      render()
      break
    case 'start-mini':
      startMiniGame(mini)
      break
    case 'start-quiz-challenge':
      startQuizChallenge()
      break
    case 'start-puzzle-quest':
      startPuzzleQuest()
      break
    case 'quiz-select-option':
      selectQuizOption(option)
      break
    case 'quiz-submit':
      submitQuizAnswer()
      break
    case 'quiz-skip':
      skipQuizQuestion()
      break
    case 'quiz-hint':
      useQuizHint()
      break
    case 'puzzle-select-piece':
      selectPuzzlePiece(Number(value))
      break
    case 'puzzle-place':
      placePuzzlePiece(Number(value))
      break
    case 'puzzle-hint':
      usePuzzleHint()
      break
    case 'puzzle-toggle-preview':
      togglePuzzlePreview()
      break
    case 'puzzle-next-theme':
      cyclePuzzleTheme()
      break
    case 'mini-click':
      playMiniGame()
      break
    case 'mini-puzzle-select':
      selectMiniPuzzlePiece(Number(value))
      break
    case 'mini-puzzle-place':
      placeMiniPuzzlePiece(Number(value))
      break
    case 'mini-puzzle-hint':
      useMiniPuzzleHint()
      break
    case 'select-theme':
      if (theme) {
        const themeObj = themes.find(t => t.id === theme)
        if (state.collections.themes.has(theme)) {
          state.theme = theme
          state.message = `Theme "${themeObj.label}" dipilih!`
          saveGame()
          playSound('click')
        } else {
          state.message = `Theme "${themeObj.label}" belum dibuka. Beli di Shop!`
        }
        render()
      }
      break
    case 'view-crystal':
      const crystal = target.dataset.crystal
      if (state.crystals.has(crystal)) {
        const story = regionStory[crystal]
        state.storyPopup = {
          title: story.title,
          message: story.story || `Kamu mendapatkan ${story.crystal}!`,
          icon: story.icon
        }
      } else {
        state.message = 'Crystal belum didapatkan. Selesaikan region untuk membukanya!'
      }
      render()
      break
    case 'open-treasure':
      if (state.collections.treasureChests > 0) {
        state.treasurePopup = {
          opened: true,
          canClaim: true,
          chests: state.collections.treasureChests,
          rewards: {
            coin: Math.floor(Math.random() * 100) + 50,
            hint: Math.floor(Math.random() * 3) + 1,
            fragment: Math.floor(Math.random() * 2) + 1
          }
        }
        state.message = 'Treasure chest siap dibuka. Tekan "Terima Hadiah" untuk claim.'
      }
      render()
      break
    case 'claim-treasure':
      if (!state.treasurePopup) {
        render()
        break
      }
      if (state.treasurePopup.canClaim && state.collections.treasureChests > 0) {
        const rewards = state.treasurePopup.rewards || { coin: 0, hint: 0, fragment: 0 }
        state.collections.treasureChests -= 1
        state.coins += rewards.coin
        state.hintCount += rewards.hint
        state.collections.themeFragments += rewards.fragment
        state.showConfetti = true
        state.message = `🎉 Dapatkan ${rewards.coin} 🪙, ${rewards.hint} 💡, ${rewards.fragment} ✨!`
        playSound('success')
        saveGame()
        window.setTimeout(() => {
          state.showConfetti = false
          render()
        }, 1600)
      }
      state.treasurePopup = null
      render()
      break
    default:
      break
  }
}

function changeScreen(screen) {
  if (state.screen === 'puzzle-quest' && screen !== 'puzzle-quest') {
    stopPuzzleQuestTimer()
  }
  if (screen !== 'game') {
    clearHintPattern(false)
  }
  if (puzzleCompleteTimeoutId && screen !== 'puzzle-quest') {
    window.clearTimeout(puzzleCompleteTimeoutId)
    puzzleCompleteTimeoutId = null
  }
  if (screen === 'splash') {
    scheduleSplashTransition()
  } else {
    clearSplashTransition()
  }
  state.screen = screen
  if (screen === 'menu') {
    openDailyRewardPopup()
  }
  render()
}

function getNextDailyReward() {
  const today = getTodayKey()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const alreadyClaimedToday = state.collections.dailyLoginClaimed === today
  const last = state.collections.dailyLoginClaimed
  const currentStreak = state.collections.dailyStreak || 0
  const day = alreadyClaimedToday
    ? Math.max(1, Math.min(7, currentStreak || 1))
    : last === yesterday
      ? Math.min(7, currentStreak + 1)
      : 1
  const rewardData = dailyRewards[day - 1] || dailyRewards[0]
  return { day, rewardData, alreadyClaimedToday }
}

function openDailyRewardPopup() {
  const { day, rewardData, alreadyClaimedToday } = getNextDailyReward()
  state.dailyRewardPopup = {
    ...rewardData,
    day,
    alreadyClaimedToday
  }
}

function claimDailyReward() {
  const today = getTodayKey()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (state.collections.dailyLoginClaimed === today) {
    state.message = 'Daily reward hari ini sudah diambil.'
    render()
    return
  }
  
  // Calculate day in streak (1-7)
  const last = state.collections.dailyLoginClaimed
  let streak = state.collections.dailyStreak || 0
  if (last === yesterday) {
    streak = (streak || 0) + 1
  } else {
    streak = 1
  }
  streak = Math.min(streak, 7)
  state.collections.dailyStreak = streak
  state.collections.dailyLoginClaimed = today

  // Get reward for day
  const rewardData = dailyRewards[streak - 1] || dailyRewards[0]
  const reward = rewardData.amount || 20
  let rewardNote = rewardData.reward
  
  // Apply reward
  switch (rewardData.type) {
    case 'coin':
      state.coins += reward
      break
    case 'hint':
      state.hintCount = (state.hintCount || 0) + reward
      break
    case 'fragment':
      state.collections.themeFragments += reward
      break
    case 'chest':
      state.collections.treasureChests = (state.collections.treasureChests || 0) + reward
      state.treasurePopup = { chests: state.collections.treasureChests, opened: false }
      break
  }

  state.showConfetti = true
  state.dailyRewardPopup = {
    ...rewardData,
    day: streak,
    alreadyClaimedToday: true
  }
  state.lastReward = { coins: rewardData.type === 'coin' ? reward : 0, stars: 0 }
  state.message = `Hadiah hari ${streak}: ${rewardNote}`
  playSound('success')
  saveGame()
  
  // Auto-hide confetti after 2s
  setTimeout(() => {
    state.showConfetti = false
    render()
  }, 2000)
  
  render()
}

function buyShopItem(itemId) {
  const item = shopItems.find(entry => entry.id === itemId)
  if (!item) return
  if (state.coins < item.cost) {
    state.message = 'Coin tidak cukup'
    state.shopConfirm = null
    render()
    return
  }
  state.coins -= item.cost
  if ((item.type === 'theme' || item.type === 'animal') && item.unlock) {
    state.collections.themes.add(item.unlock)
    state.theme = item.unlock
  }
  if (item.type === 'background') {
    state.collections.backgrounds.add(item.id)
  }
  if (item.type === 'skin' && item.unlock) {
    state.dino.skins.add(item.unlock)
    state.dino.skin = item.unlock
  }
  state.shopConfirm = null
  state.purchaseSuccess = { message: `Berhasil membeli ${item.label}` }
  playSound('unlock')
  saveGame()
  render()
  setTimeout(() => {
    state.purchaseSuccess = null
    render()
  }, 1200)
}

function promptBuyItem(itemId) {
  const item = shopItems.find(entry => entry.id === itemId)
  if (!item) return
  state.shopConfirm = item
  render()
}


function selectDinoSkin(skinId) {
  if (!state.dino.skins.has(skinId)) {
    state.message = 'Skin Dino ini belum dimiliki.'
    render()
    return
  }
  state.dino.skin = skinId
  saveGame()
  render()
}

function startMiniGame(miniId) {
  const baseGame = {
    ...(miniGames.find(game => game.id === miniId) || miniGames[0]),
    score: 0,
    time: 20
  }

  if (baseGame.id === 'fruit-puzzle') {
    const answerGrid = Array.from({ length: 9 }, (_, index) => String(index + 1))
    baseGame.answerGrid = answerGrid
    baseGame.placedGrid = Array(answerGrid.length).fill(null)
    baseGame.tray = shuffleArray(answerGrid)
    baseGame.selectedPiece = null
    baseGame.hintsLeft = 2
    baseGame.time = 45
    baseGame.previewOn = false
    baseGame.imageUrl = miniFruitPuzzleUrl
  }

  state.miniGame = baseGame
  changeScreen('mini-game')
}

function playMiniGame() {
  if (!state.miniGame) return
  if (state.miniGame.id === 'fruit-puzzle') return
  state.miniGame.score += 1
  if (state.miniGame.score >= state.miniGame.target) {
    finishMiniGameReward(state.miniGame.id)
    return
  }
  render()
}

function selectMiniPuzzlePiece(index) {
  const game = state.miniGame
  if (!game || game.id !== 'fruit-puzzle') return
  if (!Number.isInteger(index) || index < 0 || index >= game.tray.length) return
  game.selectedPiece = index
  state.message = 'Potongan dipilih. Sekarang klik slot kosong di board.'
  render()
}

function placeMiniPuzzlePiece(slotIndex) {
  const game = state.miniGame
  if (!game || game.id !== 'fruit-puzzle') return
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= game.answerGrid.length) return
  if (game.selectedPiece === null) {
    state.message = 'Pilih potongan puzzle dulu dari tray.'
    render()
    return
  }
  if (game.placedGrid[slotIndex]) {
    state.message = 'Slot ini sudah terisi. Pilih slot kosong.'
    render()
    return
  }

  const candidate = game.tray[game.selectedPiece]
  if (!candidate) {
    game.selectedPiece = null
    render()
    return
  }

  if (candidate === game.answerGrid[slotIndex]) {
    game.placedGrid[slotIndex] = candidate
    game.tray.splice(game.selectedPiece, 1)
    game.selectedPiece = null
    game.score += 1
    state.message = 'Bagus! Potongan cocok.'
    playSound('success')
    if (game.score >= game.target) {
      finishMiniGameReward(game.id)
      return
    }
  } else {
    state.message = 'Belum cocok. Coba slot lain.'
    playSound('wrong')
  }
  render()
}

function useMiniPuzzleHint() {
  const game = state.miniGame
  if (!game || game.id !== 'fruit-puzzle') return
  if ((game.hintsLeft || 0) <= 0) {
    state.message = 'Hint mini puzzle habis.'
    render()
    return
  }

  const emptyIndex = game.placedGrid.findIndex(slot => !slot)
  if (emptyIndex < 0) {
    state.message = 'Puzzle sudah lengkap.'
    render()
    return
  }
  const needed = game.answerGrid[emptyIndex]
  const trayIndex = game.tray.findIndex(piece => piece === needed)
  if (trayIndex < 0) {
    state.message = 'Hint tidak tersedia saat ini.'
    render()
    return
  }

  game.placedGrid[emptyIndex] = needed
  game.tray.splice(trayIndex, 1)
  game.selectedPiece = null
  game.hintsLeft -= 1
  game.score += 1
  state.message = 'Hint dipakai: satu slot terisi otomatis.'
  playSound('click')
  if (game.score >= game.target) {
    finishMiniGameReward(game.id)
    return
  }
  render()
}

function finishMiniGameReward(gameId) {
  const bonus = gameId === 'memory-dino'
    ? { coins: 15, xp: 20, fragment: 2 }
    : gameId === 'fruit-puzzle'
      ? { coins: 45, xp: 35, fragment: 2 }
      : { coins: 20, xp: 25, fragment: 1 }
  state.coins += bonus.coins
  addDinoXp(bonus.xp)
  state.collections.themeFragments += bonus.fragment
  state.lastReward = { coins: bonus.coins, stars: 0, crystal: null, xp: bonus.xp, fragment: bonus.fragment }
  state.message = `Bonus selesai: +${bonus.coins} coin, +${bonus.xp} XP, +${bonus.fragment} fragment.`
  state.miniGame = null
  saveGame()
  changeScreen('result')
}

function isLevelUnlocked(levelId) {
  return state.unlockedLevels.has(levelId)
}

function getTotalStars() {
  return Object.values(state.levelStars).reduce((total, value) => total + (Number(value) || 0), 0)
}

function isRegionAccessible(regionId) {
  const required = regionUnlockRequirement[regionId] || 0
  return getTotalStars() >= required
}

function getTotalCompletion() {
  const finished = Object.values(state.levelStars).filter(stars => stars > 0).length
  const total = levels.length
  return total ? Math.round((finished / total) * 100) : 0
}

function getPlayerLevel() {
  const completed = Object.values(state.levelStars).filter(stars => stars > 0).length
  return Math.max(1, Math.floor(completed / 2) + 1)
}

function getPlayerXpPercent() {
  const completed = Object.values(state.levelStars).filter(stars => stars > 0).length
  const stars = Object.values(state.levelStars).reduce((total, value) => total + value, 0)
  const xp = (completed * 22 + stars * 9 + state.achievements.size * 14) % 100
  return Math.max(8, xp || getTotalCompletion())
}

function getDailyProgress() {
  return Math.min(100, state.stats.completedLevels > 0 ? 100 : Math.round((state.stats.played / 1) * 60))
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getDinoXpPercent() {
  return Math.min(100, state.dino.xp)
}

function addDinoXp(amount) {
  state.dino.xp += amount
  while (state.dino.xp >= 100) {
    state.dino.xp -= 100
    state.dino.level += 1
  }
}

function getDinoEvolutionLabel() {
  if (state.dino.level >= 15) return 'Crystal Dino'
  if (state.dino.level >= 10) return 'Adventure Dino'
  if (state.dino.level >= 5) return 'Explorer Dino'
  return 'Baby Dino'
}

function checkTreasureUnlock() {
  const completed = state.stats.completedLevels || 0
  const shouldUnlock = completed > 0 && completed % 5 === 0
  if (shouldUnlock && !state.treasurePopup) {
    state.collections.treasureChests = (state.collections.treasureChests || 0) + 1
    state.treasurePopup = { chests: state.collections.treasureChests, opened: false }
    playSound('unlock')
  }
}

function getRegionUnlockInfo(levelId) {
  const level = getLevelById(levelId)
  if (!level) return null
  const region = getRegionById(level.region)
  const completedInRegion = region.levels.filter(id => (state.levelStars[id] || 0) > 0).length
  const story = regionStory[level.region]
  if (!story || completedInRegion !== region.levels.length || state.crystals.has(level.region)) {
    return null
  }
  return {
    region,
    title: story.title,
    crystal: story.crystal,
    icon: story.icon
  }
}

function getUnlockedRegionCount() {
  return regions.filter((region, index) => index === 0 || regions[index - 1].levels.some(levelId => (state.levelStars[levelId] || 0) > 0)).length
}

function shouldOfferMiniGame() {
  return Boolean(state.lastReward?.miniAvailable)
}

function getActiveMiniGame() {
  return state.miniGame || miniGames[0]
}

function getMiniGameProgress(game) {
  if (!game) return 0
  if (game.id === 'fruit-puzzle') {
    return game.placedGrid ? game.placedGrid.filter(Boolean).length : 0
  }
  return game.score || 0
}

function loadLevel(levelId) {
  const level = getLevelById(levelId)
  if (!level) return
  state.selectedLevel = levelId
  const difficulty = level.difficulty || 'medium'
  const savedGameCandidate = state.activeGame?.levelId === levelId ? state.activeGame : null
  const savedGame = savedGameCandidate
    && validateGeneratedPuzzle(savedGameCandidate.initialBoard, savedGameCandidate.solutionBoard, difficulty)
    && Array.isArray(savedGameCandidate.gameBoard)
    && savedGameCandidate.gameBoard.length === 81
    && savedGameCandidate.gameBoard.every((value, index) => {
      if (!Number.isInteger(value) || value < 0 || value > 9) {
        return false
      }
      const initialValue = savedGameCandidate.initialBoard[index]
      if (initialValue > 0 && value !== initialValue) {
        return false
      }
      return value === 0 || value === savedGameCandidate.solutionBoard[index]
    })
    ? savedGameCandidate
    : null
  const generated = !savedGame ? generatePuzzle(difficulty) : null
  const initialBoard = savedGame?.initialBoard?.length === 81 ? savedGame.initialBoard : generated?.gameBoard || []
  const gameBoard = savedGame?.gameBoard?.length === 81 ? savedGame.gameBoard : initialBoard
  const solutionBoard = savedGame?.solutionBoard?.length === 81 ? savedGame.solutionBoard : generated?.solutionBoard || []
  state.board = [...gameBoard]
  state.initialBoard = [...initialBoard]
  state.solution = [...solutionBoard]
  state.fixed = initialBoard.map(value => value > 0)
  state.history = []
  state.errors = []
  state.timeSeconds = savedGame?.timeSeconds ?? 0
  state.lives = savedGame?.lives ?? 8
  state.mistakes = savedGame?.mistakes ?? 0
  state.hintCount = savedGame?.hintCount ?? 0
  clearHintPattern(false)
  clearMoveFeedback(false)
  state.pencilMode = false
  state.selectedCell = savedGame?.selectedCell ?? null
  state.message = savedGame
    ? 'Progress Sudoku dilanjutkan. Lanjutkan dari langkah terakhirmu.'
    : `Board ${difficulty} baru siap. Isi semua kotak dengan angka yang cocok.`
  state.activeGame = {
    levelId,
    difficulty,
    initialBoard: [...state.initialBoard],
    gameBoard: [...state.board],
    solutionBoard: [...state.solution],
    lives: state.lives,
    mistakes: state.mistakes,
    timeSeconds: state.timeSeconds,
    hintCount: state.hintCount,
    selectedCell: state.selectedCell
  }
  saveGame()
  startTimer()
}

function clearMoveFeedback(shouldRender = false) {
  if (moveFeedbackTimeoutId) {
    window.clearTimeout(moveFeedbackTimeoutId)
    moveFeedbackTimeoutId = null
  }
  state.moveFeedback = null
  if (shouldRender && state.screen === 'game') {
    render()
  }
}

function setMoveFeedback(index, status) {
  clearMoveFeedback(false)
  state.moveFeedback = { index, status }
  moveFeedbackTimeoutId = window.setTimeout(() => {
    clearMoveFeedback(true)
  }, 850)
}

function syncActiveGameState() {
  if (!state.selectedLevel || state.board.length !== 81 || state.solution.length !== 81) return
  state.activeGame = {
    levelId: state.selectedLevel,
    difficulty: state.activeGame?.difficulty || getLevelById(state.selectedLevel)?.difficulty || 'medium',
    initialBoard: [...state.initialBoard],
    gameBoard: [...state.board],
    solutionBoard: [...state.solution],
    lives: state.lives,
    mistakes: state.mistakes,
    timeSeconds: state.timeSeconds,
    hintCount: state.hintCount,
    selectedCell: state.selectedCell
  }
}

function getRow(index) {
  return Math.floor(index / 9)
}

function getCol(index) {
  return index % 9
}

function getBox(index) {
  const row = getRow(index)
  const col = getCol(index)
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

function clearHintPattern(shouldRender = true) {
  if (hintPatternTimeoutId) {
    window.clearTimeout(hintPatternTimeoutId)
    hintPatternTimeoutId = null
  }
  state.hintPattern = null
  if (shouldRender && state.screen === 'game') {
    render()
  }
}

function showHintPattern(index) {
  const hintValue = state.solution[index]
  state.hintPattern = {
    index,
    row: getRow(index),
    col: getCol(index),
    box: getBox(index),
    value: hintValue
  }
  if (hintPatternTimeoutId) {
    window.clearTimeout(hintPatternTimeoutId)
  }
  hintPatternTimeoutId = window.setTimeout(() => {
    clearHintPattern(true)
  }, 3200)
}

function startTimer() {
  stopTimer()
  state.timerId = window.setInterval(() => {
    state.timeSeconds += 1
    syncActiveGameState()
    if (state.timeSeconds % 5 === 0) {
      saveGame()
    }
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
  if (state.lives === 0) {
    state.message = 'Nyawa habis. Ulang level untuk mencoba lagi.'
    render()
    return
  }

  if (state.fixed[index]) return
  if (state.board[index] === value) return

  state.history.push({
    board: [...state.board],
    selectedCell: state.selectedCell,
    mistakes: state.mistakes,
    lives: state.lives,
    message: state.message
  })
  state.selectedCell = index
  state.board[index] = value
  state.errors = validateBoard(state.board).errors

  if (value === 0) {
    clearMoveFeedback(false)
    syncActiveGameState()
    saveGame()
    state.message = 'Kotak dikosongkan. Isi lagi dengan tenang.'
    render()
    return
  }

  if (!isValidPlacement(state.board, index, value)) {
    state.mistakes += 1
    state.lives = Math.max(0, state.lives - 1)
    setMoveFeedback(index, 'wrong')
    playSound('wrong')
    state.message = state.lives > 0
      ? 'Ups! Angka bentrok dengan aturan Sudoku.'
      : 'Nyawa habis. Ulang level untuk mencoba lagi.'
  } else {
    setMoveFeedback(index, 'correct')
    state.message = 'Bagus! Terus isi dengan percaya diri.'
    playSound('click')
  }

  syncActiveGameState()
  saveGame()

  if (state.board.every(cell => cell > 0) && state.errors.length === 0) {
    const solved = state.board.every((cell, cellIndex) => cell === state.solution[cellIndex])
    if (solved) {
      completeLevel()
      return
    }
    state.message = 'Masih ada angka belum tepat. Coba cek pola lagi.'
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
  state.errors = validateBoard(state.board).errors
  clearMoveFeedback(false)
  syncActiveGameState()
  saveGame()
  state.message = 'Kotak dikosongkan. Isi lagi dengan tenang.'
  render()
}

function resetLevel() {
  if (!state.initialBoard.length || !state.solution.length) return
  state.board = [...state.initialBoard]
  state.fixed = state.initialBoard.map(value => value > 0)
  state.history = []
  state.errors = []
  state.timeSeconds = 0
  state.lives = 8
  state.mistakes = 0
  state.hintCount = 0
  state.selectedCell = null
  clearHintPattern(false)
  clearMoveFeedback(false)
  state.message = 'Level direset. Board kembali ke kondisi awal.'
  syncActiveGameState()
  saveGame()
  playSound('click')
  render()
}

function checkBoardState() {
  state.errors = validateBoard(state.board).errors
  if (state.errors.length > 0) {
    state.message = `Masih ada ${state.errors.length} kotak yang bentrok. Coba cek lagi.`
    render()
    return
  }
  if (state.board.some(cell => cell === 0)) {
    state.message = 'Board aman sejauh ini. Masih ada kotak kosong yang perlu diisi.'
    render()
    return
  }
  const solved = state.board.every((cell, index) => cell === state.solution[index])
  if (!solved) {
    state.message = 'Struktur board sudah rapi, tapi masih ada angka yang belum tepat.'
    render()
    return
  }
  completeLevel()
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
  state.mistakes = last.mistakes ?? state.mistakes
  state.lives = last.lives ?? state.lives
  state.message = last.message ?? state.message
  state.errors = validateBoard(state.board).errors
  clearMoveFeedback(false)
  syncActiveGameState()
  saveGame()
  playSound('click')
  render()
}

function applyHint() {
  if (state.hintCount >= MAX_HINTS_PER_LEVEL) {
    state.message = `Hint habis (${MAX_HINTS_PER_LEVEL}/${MAX_HINTS_PER_LEVEL}). Coba lanjut tanpa hint!`
    render()
    return
  }

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
  state.selectedCell = index
  showHintPattern(index)
  state.errors = []
  state.errors = validateBoard(state.board).errors
  state.hintCount += 1
  setMoveFeedback(index, 'correct')
  state.message = 'Hint diberikan: kotak terang = target, hijau = baris/kolom, biru = kotak 3x3.'
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
  clearMoveFeedback(false)
  clearHintPattern(false)
  const stars = calculateStars(state.timeSeconds, state.mistakes)
  const score = calculateScore(state.timeSeconds, state.hintCount, state.mistakes)
  const reward = coinsForStars(stars)
  const currentStars = state.levelStars[state.selectedLevel] || 0
  state.levelStars[state.selectedLevel] = Math.max(currentStars, stars)
  const storyUnlock = getRegionUnlockInfo(state.selectedLevel)
  const xpReward = 30 + stars * 10
  state.coins += reward
  addDinoXp(xpReward)
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
  if (storyUnlock) {
    state.crystals.add(storyUnlock.region.id)
    state.storyPopup = storyUnlock
  }
  const miniAvailable = state.stats.completedLevels > 0 && state.stats.completedLevels % 3 === 0
  state.lastReward = {
    coins: reward,
    score,
    stars,
    crystal: storyUnlock?.crystal || null,
    xp: xpReward,
    fragment: miniAvailable ? 1 : 0,
    miniAvailable
  }
  unlockNextLevel(state.selectedLevel)
  checkTreasureUnlock()
  state.activeGame = null
  saveGame(false)
  state.message = `🎉 Level Complete! Skor ${score}. Kamu mendapat ${stars} bintang, ${reward} coin, dan ${xpReward} XP.`
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
    case 'quiz-challenge':
      return renderQuizChallengeScreen()
    case 'puzzle-quest':
      return renderPuzzleQuestScreen()
    case 'shop':
      return renderShopScreen()
    case 'game':
      return renderGameScreen()
    case 'result':
      return renderResultScreen()
    case 'achievement':
      return renderAchievementScreen()
    case 'collection':
      return renderCollectionScreen()
    case 'mini-games-select':
      return renderMiniGamesSelectScreen()
    case 'mini-game':
      return renderMiniGameScreen()
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
    case 'splash':
      return renderSplashScreen()
    default:
      return renderSplashScreen()
  }
}

function renderAppShell(content) {
  const showNav = !['splash', 'login', 'story', 'quiz-challenge', 'puzzle-quest'].includes(state.screen)
  return `
    <div class="mobile-shell web-shell">
      <div class="mobile-app web-app">
        ${content}
      </div>
      ${showNav ? renderBottomNav() : ''}
      ${state.showConfetti ? `<div class="confetti-container">${Array.from({length:50}).map((_, i) => `<div class="confetti" style="left:${Math.random()*100}%;animation-delay:${Math.random()*0.5}s"></div>`).join('')}</div>` : ''}
      ${state.storyPopup ? renderStoryPopup() : ''}
      ${state.treasurePopup ? renderTreasurePopup() : ''}
      ${state.purchaseSuccess ? renderPurchaseSuccess() : ''}
      ${state.dailyRewardPopup ? renderDailyRewardPopup() : ''}
      ${state.puzzleCompletePopup ? renderPuzzleCompletePopup() : ''}
    </div>
  `
}

function render() {
  document.body.classList.toggle('dark-mode', state.darkMode)
  const content = getScreenHTML()
  app.classList.toggle('splash-active', state.screen === 'splash')
  app.innerHTML = renderAppShell(content)
}

function renderSplashScreen() {
  return `
    <div class="page splash-screen splash-loading-screen">
      <div class="splash-loading-stars" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="splash-content splash-loading-content">
        <img class="splash-logo splash-loading-logo" src="${logoUrl}" alt="Sudoku Adventure logo" />
        <div class="splash-loading-copy">
          <p class="splash-loading-eyebrow">WELCOME TO</p>
          <h1>SUDOKU <span>ADVENTURE</span></h1>
          <p class="splash-loading-subtitle">SMART QUEST</p>
        </div>
        <div class="splash-loading-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="88">
          <div class="splash-loading-progress-fill"></div>
        </div>
        <p class="splash-loading-caption">Loading adventure...</p>
      </div>
    </div>
  `
}

function renderMenuScreen() {
  const firstLevel = state.selectedLevel || getRegionById(state.selectedRegion)?.levels[0] || 'desert-1'
  const playerLevel = getPlayerLevel()
  const xpPercent = getPlayerXpPercent()
  const dailyProgress = getDailyProgress()
  return `
    <div class="page home-page">
      <section class="home-hero">
        <div class="home-card-head">
          <div class="home-brand">
            <img class="home-logo" src="${logoUrl}" alt="Sudoku Adventure logo" />
            <div>
              <p class="eyebrow">Sudoku Adventure</p>
              <h1>Halo, ${state.username || 'Petualang'}!</h1>
            </div>
          </div>
          <div class="coin-counter" aria-label="Koin pemain">
            <span>Coin</span>
            <strong>${state.coins}</strong>
          </div>
          <div class="home-mascot">🦖</div>
        </div>

        <div class="home-mascot-scene">
          <img class="home-mascot-img" src="${dinoUrl}" alt="Dino mascot" />
          <div class="mascot-speech">
            <strong>Ready?</strong>
            <span>Level berikutnya menunggu.</span>
          </div>
        </div>

        <div class="home-status-card">
          <div class="status-row">
            <div>
              <span class="status-label">Status</span>
              <strong>${getDinoEvolutionLabel()} Lv. ${playerLevel}</strong>
            </div>
            <div class="status-pill">${getTotalCompletion()}% Map</div>
          </div>

          <div class="xp-row">
            <div class="xp-label">
              <span>XP</span>
              <strong>${xpPercent}%</strong>
            </div>
            <div class="xp-bar">
              <div class="xp-progress" style="width: ${xpPercent}%"></div>
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
              <span>🎁</span>
              <div>
                <strong>${state.collections.treasureChests}</strong>
                <small>Treasures</small>
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

      <section class="panel mini-games-quick-access">
        <button class="mini-games-promo" data-action="goto" data-value="mini-games-select">
          <div class="promo-left">
            <p class="eyebrow">Bonus Rewards</p>
            <h3>Main Mini Games</h3>
            <small>Dapatkan coins & rewards</small>
          </div>
          <div class="promo-right">🎮</div>
        </button>
      </section>

      <section class="panel home-daily-card">
        <div class="daily-header">
          <div>
            <p class="eyebrow">Daily Reward</p>
            <h3>Claim bonus koin hari ini</h3>
          </div>
          ${state.collections.dailyLoginClaimed === getTodayKey() ? '<button class="button mini" disabled>Sudah Diklaim</button>' : '<button class="button mini primary pulse-button" data-action="claim-daily">Claim</button>'}
        </div>
        <div class="daily-bar">
          <span>Task: Selesaikan 1 level</span>
          <strong>+25 Coin</strong>
        </div>
        <div class="daily-progress" aria-label="Progress daily reward">
          <div class="daily-progress-fill" style="width: ${dailyProgress}%"></div>
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
  const icons = {
    Home: '🏠',
    Story: '🗺️',
    Challenge: '⚡',
    Achievement: '🏆',
    Stats: '📊',
    Shop: '🛍️',
    Profile: '👤'
  }
  const iconEmoji = icons[label] || icon || '❓'
  return `
    <button class="home-action-button" data-action="goto" data-value="${screen}">
      <span class="home-action-icon">${iconEmoji}</span>
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
          <p class="eyebrow">Toko Hadiah</p>
          <h2>Belanja Item Eksklusif</h2>
        </div>
        <div class="tag">${state.coins} 🪙</div>
      </section>
      ${state.message ? `<div class="panel"><div class="notification">${state.message}</div></div>` : ''}
      <section class="panel shop-grid">
        ${shopItems.map(item => {
          const owned = item.type === 'background'
            ? state.collections.backgrounds.has(item.id)
            : item.type === 'skin'
              ? state.dino.skins.has(item.unlock)
              : state.collections.themes.has(item.unlock || item.id)
          const canAfford = state.coins >= item.cost
          return `
            <article class="shop-card ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'disabled' : ''}">
              <div class="shop-card-header">
                <span class="shop-preview">${item.icon}</span>
                <h3>${item.label}</h3>
              </div>
              <p class="shop-description">${item.description}</p>
              <div class="shop-footer">
                ${owned ? `<span class="owned-badge">✓ Dimiliki</span>` : `<span class="price">${item.cost} 🪙</span>`}
                ${!owned ? `<button class="button mini ${canAfford ? 'primary' : 'outline'}" data-action="buy-item" data-item="${item.id}" ${!canAfford ? 'disabled' : ''}>Beli</button>` : ''}
              </div>
            </article>
          `
        }).join('')}
      </section>
      ${state.shopConfirm ? `
        <div class="modal-overlay">
          <div class="shop-confirm panel">
            <h3>Konfirmasi Pembelian</h3>
            <div class="confirm-preview">
              <span class="big-icon">${state.shopConfirm.icon}</span>
              <div>
                <strong>${state.shopConfirm.label}</strong>
                <p>${state.shopConfirm.description}</p>
              </div>
            </div>
            <p class="confirm-price">Harga: <strong>${state.shopConfirm.cost} 🪙</strong></p>
            <div class="button-grid">
              <button class="button outline" data-action="cancel-buy">Batal</button>
              <button class="button primary" data-action="confirm-buy">Beli</button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `
}

function renderStoryScreen() {
  const totalStars = getTotalStars()
  const totalStarTarget = Math.max(1, levels.length * 3)
  const storyProgress = Math.min(100, Math.round((totalStars / totalStarTarget) * 100))
  const crystalFound = Math.min(levels.length * 2, totalStars)
  const dailyTarget = 2
  const dailyDone = Math.min(dailyTarget, state.stats.completedLevels || 0)
  const nodeOrder = [
    { id: 'desert', title: 'Desert Ruins', slot: 'desert', order: 1 },
    { id: 'forest', title: 'Forest Kingdom', slot: 'forest', order: 2 },
    { id: 'mountain', title: 'Sky Mountain', slot: 'mountain', order: 3 },
    { id: 'snow', title: 'Snow Valley', slot: 'snow', order: 4 },
    { id: 'castle', title: 'Mystery Castle', slot: 'castle', order: 5 }
  ]

  return `
    <div class="page story-page story-epic-map">
      <section class="epic-map-topbar">
        <div class="epic-map-title-pill">
          <button class="epic-map-back" data-action="goto" data-value="menu" aria-label="Kembali ke Home">←</button>
          <strong>Adventure World</strong>
          <button class="epic-map-help" type="button" data-action="goto" data-value="achievement" aria-label="Buka bantuan">?</button>
        </div>
        <div class="epic-map-currency-row">
          <span class="epic-currency"><b>🪙</b>${state.coins}</span>
          <span class="epic-currency"><b>💎</b>${state.collections.themeFragments}</span>
          <span class="epic-currency"><b>❤️</b>${state.lives} MAX</span>
        </div>
      </section>

      <section class="epic-map-stage" aria-label="Peta petualangan">
        <div class="epic-map-progress-card">
          <p>Story Progress</p>
          <div class="epic-progress-bar"><span style="width:${storyProgress}%"></span></div>
          <div class="epic-progress-meta">
            <small>Crystal ditemukan: ${crystalFound} / ${levels.length * 2}</small>
            <strong>${storyProgress}%</strong>
          </div>
        </div>

        <aside class="epic-map-mission-card">
          <h4>Daily Mission</h4>
          <p>Selesaikan ${dailyTarget} Sudoku</p>
          <small>Hadiah: 💎 10</small>
          <strong>${dailyDone}/${dailyTarget}</strong>
        </aside>

        <svg class="epic-path-network" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
          <path class="epic-path-glow" d="M140 378 C206 388, 254 430, 310 495" />
          <path class="epic-path-glow" d="M310 495 C435 528, 565 528, 690 495" />
          <path class="epic-path-glow" d="M690 495 C748 436, 794 390, 860 378" />
          <path class="epic-path-glow" d="M500 238 C442 324, 384 412, 310 495" />
          <path class="epic-path-glow" d="M500 238 C562 324, 620 410, 690 495" />
          <path class="epic-path-dot" d="M140 378 C206 388, 254 430, 310 495" />
          <path class="epic-path-dot" d="M310 495 C435 528, 565 528, 690 495" />
          <path class="epic-path-dot" d="M690 495 C748 436, 794 390, 860 378" />
          <path class="epic-path-dot" d="M500 238 C442 324, 384 412, 310 495" />
          <path class="epic-path-dot" d="M500 238 C562 324, 620 410, 690 495" />
        </svg>

        ${nodeOrder.map(meta => {
          const region = getRegionById(meta.id)
          if (!region) return ''
          const areaImage = areaNodeImages[meta.id] || puzzleArtUrl
          const completed = region.levels.filter(levelId => (state.levelStars[levelId] || 0) > 0).length
          const unlocked = isRegionAccessible(region.id)
          const requirement = regionUnlockRequirement[region.id] || 0
          const active = state.selectedRegion === region.id
          return `
            <button
              class="epic-map-node slot-${meta.slot} ${unlocked ? 'unlocked' : 'locked'} ${active ? 'active' : ''}"
              type="button"
              data-action="${unlocked ? 'select-region' : ''}"
              data-region="${region.id}"
              ${unlocked ? '' : 'disabled'}>
              <span class="epic-node-rank">${meta.order}</span>
              <span class="epic-node-main">
                <img class="epic-node-image" src="${areaImage}" alt="${meta.title}" loading="lazy" />
                ${unlocked ? '' : '<span class="epic-node-lock-indicator" aria-hidden="true">🔒</span>'}
              </span>
              <span class="epic-node-name">${meta.title}</span>
              <span class="epic-node-meta">⭐ ${completed}/${region.levels.length}${unlocked ? '' : ` • 🔒${requirement}`}</span>
            </button>
          `
        }).join('')}

        <nav class="epic-map-dock" aria-label="Map navigation">
          <button class="epic-dock-item" data-action="goto" data-value="menu"><span>🏠</span><small>Home</small></button>
          <button class="epic-dock-item active" data-action="goto" data-value="story"><span>🗺️</span><small>Map</small></button>
          <button class="epic-dock-item" data-action="goto" data-value="challenge"><span>🎮</span><small>Puzzle</small></button>
          <button class="epic-dock-item" data-action="goto" data-value="achievement"><span>🏆</span><small>Challenge</small></button>
          <button class="epic-dock-item" data-action="goto" data-value="shop"><span>🛍️</span><small>Shop</small></button>
        </nav>
      </section>
    </div>
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
  const fallback = unlockedLevels[0] || levels[0]
  const challengeItems = [
    {
      title: 'Quiz Challenge',
      subtitle: 'Jawab 10 pertanyaan',
      icon: '❓',
      rewardCoins: 100,
      rewardGems: 5,
      action: 'start-quiz-challenge',
      level: unlockedLevels[0] || fallback
    },
    {
      title: 'Time Attack',
      subtitle: 'Selesaikan dalam waktu 1 - 10 Menit',
      icon: '⏱️',
      rewardCoins: 150,
      rewardGems: 10,
      level: unlockedLevels[1] || fallback
    },
    {
      title: 'Crystal Hunter',
      subtitle: 'Kumpulkan Crystal dalam 5 Menit',
      icon: '💎',
      rewardCoins: 120,
      rewardGems: 8,
      level: unlockedLevels[2] || fallback
    },
    {
      title: 'Puzzle Quest',
      subtitle: 'Selesaikan 3 Sudoku untuk mendapatkan potongan puzzle',
      icon: '🧩',
      rewardCoins: 200,
      rewardGems: 12,
      action: 'start-puzzle-quest',
      level: unlockedLevels[3] || fallback
    }
  ]

  return `
    <div class="page challenge-showcase-page">
      <section class="challenge-showcase-shell">
        <header class="challenge-showcase-header">
          <button class="challenge-showcase-nav" data-action="goto" data-value="menu">←</button>
          <h2>Challenge Mode</h2>
          <button class="challenge-showcase-close" data-action="goto" data-value="menu">×</button>
        </header>

        <section class="challenge-showcase-grid">
          ${challengeItems.map(item => renderChallengeCard(item)).join('')}
        </section>
      </section>
    </div>
  `
}

function renderChallengeCard(item) {
  const levelId = item.level?.id || levels[0].id
  const action = item.action || 'play-level'
  const levelAttr = action === 'play-level' ? `data-level="${levelId}"` : ''
  return `
    <article class="challenge-card challenge-showcase-card" type="button">
      <div class="challenge-showcase-icon">${item.icon}</div>
      <div class="challenge-showcase-copy">
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
        <div class="challenge-showcase-reward">
          <span>Hadiah</span>
          <strong>🪙 ${item.rewardCoins}</strong>
          <strong>💎 ${item.rewardGems}</strong>
        </div>
      </div>
      <button class="challenge-start-btn" type="button" data-action="${action}" ${levelAttr}>MULAI</button>
    </article>
  `
}

function shuffleArray(list) {
  const copied = [...list]
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copied[i]
    copied[i] = copied[j]
    copied[j] = temp
  }
  return copied
}

function startQuizChallenge() {
  const questions = shuffleArray(quizQuestionBank).slice(0, 10)
  state.quizChallenge = {
    questions,
    index: 0,
    selected: null,
    lastResult: null,
    lockedOptions: [],
    hintsLeft: 3,
    skipsLeft: 5,
    correctCount: 0,
    attempts: [],
    rewards: { coins: 0, gems: 0, xp: 0 }
  }
  state.message = 'Quiz dimulai! Pilih jawaban yang menurutmu paling benar.'
  changeScreen('quiz-challenge')
}

function selectQuizOption(optionValue) {
  if (!state.quizChallenge || state.quizChallenge.lastResult) return
  if (!optionValue) return
  if (state.quizChallenge.lockedOptions.includes(optionValue)) return
  state.quizChallenge.selected = optionValue
  render()
}

function useQuizHint() {
  const quiz = state.quizChallenge
  if (!quiz) return
  if (quiz.lastResult) {
    state.message = 'Lanjut ke soal berikutnya untuk menggunakan hint lagi.'
    render()
    return
  }
  if (quiz.hintsLeft <= 0) {
    state.message = 'Hint quiz habis.'
    render()
    return
  }
  const current = quiz.questions[quiz.index]
  if (!current) return
  const candidates = current.options.filter(option => option !== current.answer && !quiz.lockedOptions.includes(option) && option !== quiz.selected)
  if (!candidates.length) {
    state.message = 'Hint tidak bisa dipakai lagi di soal ini.'
    render()
    return
  }
  const optionToLock = candidates[Math.floor(Math.random() * candidates.length)]
  quiz.lockedOptions.push(optionToLock)
  quiz.hintsLeft -= 1
  state.message = 'Hint dipakai: satu jawaban salah dihapus.'
  render()
}

function skipQuizQuestion() {
  const quiz = state.quizChallenge
  if (!quiz) return
  if (quiz.skipsLeft <= 0) {
    state.message = 'Kesempatan lewati soal sudah habis.'
    render()
    return
  }
  const current = quiz.questions[quiz.index]
  if (current) {
    quiz.attempts.push({
      question: current.question,
      selected: '-',
      answer: current.answer,
      correct: false,
      skipped: true
    })
  }
  quiz.skipsLeft -= 1
  advanceQuizQuestion()
}

function submitQuizAnswer() {
  const quiz = state.quizChallenge
  if (!quiz) return

  if (quiz.lastResult) {
    advanceQuizQuestion()
    return
  }

  if (!quiz.selected) {
    state.message = 'Pilih salah satu jawaban dulu.'
    render()
    return
  }

  const current = quiz.questions[quiz.index]
  if (!current) return
  const correct = quiz.selected === current.answer
  quiz.attempts.push({
    question: current.question,
    selected: quiz.selected,
    answer: current.answer,
    correct,
    skipped: false
  })
  quiz.lastResult = correct ? 'correct' : 'wrong'

  if (correct) {
    quiz.correctCount += 1
    quiz.rewards.coins += 10
    quiz.rewards.gems += 1
    quiz.rewards.xp += 5
    state.coins += 10
    state.collections.themeFragments += 1
    addDinoXp(5)
    state.message = 'Jawaban benar! +10 coin, +1 crystal, +5 XP.'
    playSound('success')
  } else {
    state.message = `Kurang tepat. Jawaban benar: ${current.answer}`
    playSound('wrong')
  }

  saveGame()
  render()
}

function advanceQuizQuestion() {
  const quiz = state.quizChallenge
  if (!quiz) return
  if (quiz.index >= quiz.questions.length - 1) {
    finishQuizChallenge()
    return
  }
  quiz.index += 1
  quiz.selected = null
  quiz.lastResult = null
  quiz.lockedOptions = []
  state.message = `Soal ${quiz.index + 1}/${quiz.questions.length}. Tetap fokus!`
  render()
}

function finishQuizChallenge() {
  const quiz = state.quizChallenge
  if (!quiz) return

  const total = quiz.questions.length
  const bonusCoins = quiz.correctCount >= 8 ? 50 : quiz.correctCount >= 5 ? 25 : 0
  if (bonusCoins > 0) {
    state.coins += bonusCoins
    quiz.rewards.coins += bonusCoins
  }

  state.lastReward = {
    coins: quiz.rewards.coins,
    stars: 0,
    crystal: null,
    xp: quiz.rewards.xp,
    fragment: quiz.rewards.gems,
    miniAvailable: false,
    mode: 'quiz',
    quizSummary: {
      total,
      correctCount: quiz.correctCount,
      hintsLeft: quiz.hintsLeft,
      wrongAnswers: quiz.attempts.filter(item => !item.correct)
    }
  }
  state.message = `Quiz selesai! Skor ${quiz.correctCount}/${total}. Reward terkumpul: ${quiz.rewards.coins} coin, ${quiz.rewards.gems} crystal, ${quiz.rewards.xp} XP.`
  state.quizChallenge = null
  saveGame()
  changeScreen('result')
}

function startPuzzleQuest() {
  const answerGrid = ['🧩1', '🧩2', '🧩3', '🧩4', '🧩5', '🧩6', '🧩7', '🧩8', '🧩9']
  state.puzzleQuest = {
    answerGrid,
    placedGrid: Array(answerGrid.length).fill(null),
    tray: shuffleArray(answerGrid),
    selectedPiece: null,
    hintsLeft: 3,
    previewOn: false,
    seconds: 0,
    rewards: {
      coins: 0,
      gems: 0,
      xp: 0
    }
  }
  state.message = 'Puzzle Quest dimulai! Pilih potongan puzzle lalu pasang ke slot yang tepat.'
  changeScreen('puzzle-quest')
  startPuzzleQuestTimer()
}

function startPuzzleQuestTimer() {
  stopPuzzleQuestTimer()
  puzzleTimerId = window.setInterval(() => {
    if (!state.puzzleQuest) return
    state.puzzleQuest.seconds += 1
    if (state.screen !== 'puzzle-quest') return
    const timerNode = document.querySelector('.puzzle-timer-value')
    if (timerNode) {
      timerNode.textContent = formatTime(state.puzzleQuest.seconds)
    }
  }, 1000)
}

function stopPuzzleQuestTimer() {
  if (!puzzleTimerId) return
  window.clearInterval(puzzleTimerId)
  puzzleTimerId = null
}

function selectPuzzlePiece(index) {
  const puzzle = state.puzzleQuest
  if (!puzzle) return
  if (!Number.isInteger(index) || index < 0 || index >= puzzle.tray.length) return
  puzzle.selectedPiece = index
  const picked = puzzle.tray[index]
  state.message = `Potongan ${picked} dipilih. Sekarang pilih slot tujuan.`
  render()
}

function placePuzzlePiece(slotIndex) {
  const puzzle = state.puzzleQuest
  if (!puzzle) return
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= puzzle.answerGrid.length) return
  if (puzzle.selectedPiece === null) {
    state.message = 'Pilih potongan puzzle dulu dari tray bawah.'
    render()
    return
  }
  if (puzzle.placedGrid[slotIndex]) {
    state.message = 'Slot ini sudah terisi. Pilih slot yang kosong.'
    render()
    return
  }

  const candidate = puzzle.tray[puzzle.selectedPiece]
  let shouldAnimatePlacement = false
  let shouldAnimateWrong = false
  if (!candidate) {
    puzzle.selectedPiece = null
    render()
    return
  }

  if (candidate === puzzle.answerGrid[slotIndex]) {
    puzzle.placedGrid[slotIndex] = candidate
    puzzle.tray.splice(puzzle.selectedPiece, 1)
    puzzle.selectedPiece = null
    puzzle.rewards.coins += 12
    puzzle.rewards.xp += 6
    state.coins += 12
    addDinoXp(6)
    state.message = 'Bagus! Potongan puzzle cocok.'
    playSound('success')
    shouldAnimatePlacement = true
    checkPuzzleQuestCompletion()
  } else {
    state.message = 'Belum cocok. Coba slot lain atau gunakan hint.'
    playSound('wrong')
    shouldAnimateWrong = true
  }

  saveGame()
  render()
  if (shouldAnimatePlacement) {
    animatePuzzleSlot(slotIndex)
  }
  if (shouldAnimateWrong) {
    animateWrongPuzzleAttempt()
  }
}

function animatePuzzleSlot(slotIndex) {
  window.requestAnimationFrame(() => {
    const slot = document.querySelector(`.puzzle-slot[data-value="${slotIndex}"]`)
    if (!slot) return
    slot.classList.add('placed-pop')
    slot.classList.add('placed-success')
    window.setTimeout(() => {
      slot.classList.remove('placed-pop')
      slot.classList.remove('placed-success')
    }, 420)
  })
}

function animateWrongPuzzleAttempt() {
  window.requestAnimationFrame(() => {
    const selectedPiece = document.querySelector('.puzzle-piece.selected')
    if (selectedPiece) {
      selectedPiece.classList.add('wrong-return')
      window.setTimeout(() => {
        selectedPiece.classList.remove('wrong-return')
      }, 420)
    }

    const board = document.querySelector('.puzzle-board-panel')
    if (!board) return
    board.classList.add('wrong-flash')
    window.setTimeout(() => {
      board.classList.remove('wrong-flash')
    }, 320)
  })
}

function usePuzzleHint() {
  const puzzle = state.puzzleQuest
  if (!puzzle) return
  if (puzzle.hintsLeft <= 0) {
    state.message = 'Hint Puzzle Quest habis.'
    render()
    return
  }

  const emptyIndex = puzzle.placedGrid.findIndex((item, idx) => !item && !puzzle.placedGrid[idx])
  if (emptyIndex < 0) {
    state.message = 'Puzzle sudah lengkap.'
    render()
    return
  }

  const needed = puzzle.answerGrid[emptyIndex]
  const trayIndex = puzzle.tray.findIndex(piece => piece === needed)
  if (trayIndex < 0) {
    state.message = 'Hint tidak dapat dipakai sekarang.'
    render()
    return
  }

  puzzle.placedGrid[emptyIndex] = needed
  puzzle.tray.splice(trayIndex, 1)
  puzzle.selectedPiece = null
  puzzle.hintsLeft -= 1
  puzzle.rewards.gems += 1
  state.collections.themeFragments += 1
  state.message = 'Hint dipakai: satu slot puzzle terisi otomatis.'
  playSound('click')
  checkPuzzleQuestCompletion()
  saveGame()
  render()
}

function togglePuzzlePreview() {
  const puzzle = state.puzzleQuest
  if (!puzzle) return
  puzzle.previewOn = !puzzle.previewOn
  state.message = puzzle.previewOn ? 'Preview pola puzzle aktif.' : 'Preview pola puzzle disembunyikan.'
  render()
}

function getPuzzleArtTheme(themeId) {
  return puzzleArtThemes.find(theme => theme.id === themeId) || puzzleArtThemes[0]
}

function cyclePuzzleTheme() {
  const currentIndex = puzzleArtThemes.findIndex(theme => theme.id === state.puzzleTheme)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % puzzleArtThemes.length : 0
  const nextTheme = puzzleArtThemes[nextIndex]
  state.puzzleTheme = nextTheme.id
  state.message = `Tema puzzle diganti ke ${nextTheme.label}.`
  saveGame(false)
  render()
}

function checkPuzzleQuestCompletion() {
  const puzzle = state.puzzleQuest
  if (!puzzle) return
  const completed = puzzle.placedGrid.every(Boolean)
  if (!completed) return

  stopPuzzleQuestTimer()
  const speedBonus = puzzle.seconds <= 90 ? 60 : puzzle.seconds <= 150 ? 35 : 15
  state.coins += speedBonus
  puzzle.rewards.coins += speedBonus

  state.lastReward = {
    coins: puzzle.rewards.coins,
    stars: 0,
    crystal: 'Puzzle Relic',
    xp: puzzle.rewards.xp,
    fragment: puzzle.rewards.gems,
    miniAvailable: false,
    mode: 'puzzle',
    puzzleSummary: {
      time: puzzle.seconds,
      hintsUsed: 3 - puzzle.hintsLeft,
      piecesPlaced: puzzle.answerGrid.length
    }
  }
  state.message = `🎉 Puzzle Complete! Waktu ${formatTime(puzzle.seconds)}. Bonus cepat +${speedBonus} coin.`
  state.puzzleCompletePopup = {
    title: '🎉 Puzzle Complete!',
    coins: puzzle.rewards.coins,
    gems: puzzle.rewards.gems,
    xp: puzzle.rewards.xp
  }
  state.showConfetti = true
  saveGame()
  render()
  if (puzzleCompleteTimeoutId) {
    window.clearTimeout(puzzleCompleteTimeoutId)
  }
  puzzleCompleteTimeoutId = window.setTimeout(() => {
    puzzleCompleteTimeoutId = null
    state.showConfetti = false
    state.puzzleCompletePopup = null
    state.puzzleQuest = null
    changeScreen('result')
  }, 1700)
}

function renderQuizChallengeScreen() {
  const quiz = state.quizChallenge
  if (!quiz) return renderChallengeScreen()

  const current = quiz.questions[quiz.index]
  if (!current) return renderChallengeScreen()

  const progressPercent = Math.round(((quiz.index + 1) / quiz.questions.length) * 100)
  const optionColors = ['green', 'yellow', 'purple', 'blue']
  const labels = ['A', 'B', 'C', 'D']

  return `
    <div class="page quiz-challenge-page">
      <section class="quiz-shell">
        <header class="quiz-top-hud">
          <button class="quiz-nav-btn" data-action="goto" data-value="challenge">←</button>
          <div class="quiz-currency-row">
            <span>❤️ ${state.lives}</span>
            <span>🪙 ${state.coins}</span>
            <span>💎 ${state.collections.themeFragments}</span>
          </div>
          <button class="quiz-help-btn" data-action="goto" data-value="achievement">?</button>
        </header>

        <div class="quiz-brand">Dino Quiz Adventure</div>

        <section class="quiz-intro">
          <img class="quiz-dino" src="${dinoUrl}" alt="Dino quiz" />
          <div>
            <p>Dino menemukan gerbang kuno. Untuk membukanya, jawab pertanyaan berikut!</p>
            <strong>Pertanyaan ${quiz.index + 1}/${quiz.questions.length}</strong>
            <div class="quiz-progress"><span style="width:${progressPercent}%"></span></div>
          </div>
        </section>

        <section class="quiz-card">
          <h2>${current.question}</h2>
          <div class="quiz-options">
            ${current.options.map((option, idx) => {
              const selected = quiz.selected === option
              const locked = quiz.lockedOptions.includes(option)
              const answered = Boolean(quiz.lastResult)
              const correct = answered && option === current.answer
              const wrong = answered && selected && option !== current.answer
              return `
                <button
                  class="quiz-option ${optionColors[idx]} ${selected ? 'selected' : ''} ${locked ? 'locked' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}"
                  data-action="quiz-select-option"
                  data-option="${option}"
                  ${locked || answered ? 'disabled' : ''}>
                  <span class="option-label">${labels[idx]}</span>
                  <span class="option-value">${option}</span>
                </button>
              `
            }).join('')}
          </div>

          <div class="quiz-reward-row">
            <span>Reward</span>
            <strong>🪙 +10</strong>
            <strong>💎 +1</strong>
            <strong>XP +5</strong>
          </div>
        </section>

        <footer class="quiz-actions">
          <button class="quiz-side-btn" data-action="quiz-skip" ${quiz.skipsLeft <= 0 ? 'disabled' : ''}>Lewati ${quiz.skipsLeft}</button>
          <button class="quiz-submit-btn" data-action="quiz-submit">${quiz.lastResult ? (quiz.index + 1 >= quiz.questions.length ? 'SELESAI' : 'LANJUT') : 'JAWAB'}</button>
          <button class="quiz-side-btn" data-action="quiz-hint" ${quiz.hintsLeft <= 0 || quiz.lastResult ? 'disabled' : ''}>Hint ${quiz.hintsLeft}</button>
        </footer>
      </section>
    </div>
  `
}

function renderPuzzleQuestScreen() {
  const puzzle = state.puzzleQuest
  if (!puzzle) return renderChallengeScreen()
  const activePuzzleTheme = getPuzzleArtTheme(state.puzzleTheme)
  const activePuzzleUrl = activePuzzleTheme.url

  const progress = Math.round((puzzle.placedGrid.filter(Boolean).length / puzzle.answerGrid.length) * 100)

  return `
    <div class="page puzzle-quest-page">
      <section class="puzzle-quest-shell">
        <header class="puzzle-quest-topbar">
          <button class="puzzle-nav-btn" data-action="goto" data-value="challenge">←</button>
          <div class="puzzle-title-wrap">
            <p>Puzzle Quest Challenge</p>
            <h2>Rakit Relic Kuno</h2>
          </div>
          <div class="puzzle-top-stats">
            <span>🪙 ${state.coins}</span>
            <span>💎 ${state.collections.themeFragments}</span>
            <span>⏱️ <strong class="puzzle-timer-value">${formatTime(puzzle.seconds)}</strong></span>
          </div>
        </header>

        <section class="puzzle-quest-main">
          <aside class="puzzle-left-panel">
            <article class="puzzle-info-card">
              <h3>Objective</h3>
              <p>Pasang 9 potongan ke posisi yang sesuai.</p>
              <div class="puzzle-progress-track"><span style="width:${progress}%"></span></div>
              <strong>${puzzle.placedGrid.filter(Boolean).length}/9 terpasang</strong>
            </article>

            <article class="puzzle-info-card">
              <h3>Reward</h3>
              <p>🪙 ${puzzle.rewards.coins}</p>
              <p>💎 ${puzzle.rewards.gems}</p>
              <p>XP ${puzzle.rewards.xp}</p>
            </article>

            <button class="puzzle-side-btn" data-action="puzzle-hint" ${puzzle.hintsLeft <= 0 ? 'disabled' : ''}>✨ Hint ${puzzle.hintsLeft}</button>
          </aside>

          <section class="puzzle-board-panel ${puzzle.previewOn ? 'preview' : ''}" style="--puzzle-art:url('${activePuzzleUrl}')">
            ${puzzle.answerGrid.map((piece, index) => {
              const filled = puzzle.placedGrid[index]
              const pieceNumber = filled ? Number(filled.replace('🧩', '')) : Number(piece.replace('🧩', ''))
              const col = ((pieceNumber - 1) % 3) * 50
              const row = Math.floor((pieceNumber - 1) / 3) * 50
              return `
                <button
                  class="puzzle-slot shape-${Number(piece.replace('🧩', ''))} ${filled ? 'filled' : ''}"
                  data-action="puzzle-place"
                  data-value="${index}"
                  style="--piece-col:${col}%;--piece-row:${row}%;"
                  aria-label="Slot ${index + 1}">
                  <span class="puzzle-slot-label" aria-hidden="true"></span>
                </button>
              `
            }).join('')}
          </section>

          <aside class="puzzle-right-panel">
            <button class="puzzle-icon-btn" data-action="puzzle-toggle-preview">👁️ ${puzzle.previewOn ? 'Hide' : 'Show'} Preview</button>
            <button class="puzzle-icon-btn" data-action="puzzle-next-theme">🎨 Theme: ${activePuzzleTheme.label}</button>
            <button class="puzzle-icon-btn" data-action="puzzle-hint" ${puzzle.hintsLeft <= 0 ? 'disabled' : ''}>🧠 Auto Place</button>
            <button class="puzzle-icon-btn" data-action="goto" data-value="challenge">🚪 Exit</button>
          </aside>
        </section>

        <footer class="puzzle-tray-panel">
          <div class="puzzle-tray-head">
            <p>Pilih potongan:</p>
            <strong>${puzzle.selectedPiece !== null ? `Terpilih ${puzzle.tray[puzzle.selectedPiece] || '-'}` : 'Belum ada yang dipilih'}</strong>
          </div>
          <div class="puzzle-tray-grid">
            ${puzzle.tray.map((piece, index) => {
              const pieceNumber = Number(piece.replace('🧩', ''))
              const col = ((pieceNumber - 1) % 3) * 50
              const row = Math.floor((pieceNumber - 1) / 3) * 50
              return `
                <button
                  class="puzzle-piece shape-${pieceNumber} ${puzzle.selectedPiece === index ? 'selected' : ''}"
                  data-action="puzzle-select-piece"
                  data-value="${index}"
                  style="--piece-col:${col}%;--piece-row:${row}%;--puzzle-art:url('${activePuzzleUrl}')"
                  aria-label="Potongan ${pieceNumber}">
                </button>
              `
            }).join('')}
          </div>
        </footer>
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
  const starsEarned = state.levelStars[state.selectedLevel] || 0
  const stageProgress = Math.round((state.board.filter(cell => cell > 0).length / 81) * 100)
  const liveScore = calculateScore(state.timeSeconds, state.hintCount, state.mistakes)

  return `
    <div class="page game-page game-quest-page game-fit-screen">
      <section class="quest-top-row">
        <div class="quest-title-panel">
          <button class="icon-action" data-action="goto" data-value="story">←</button>
          <div>
            <p class="eyebrow">${getRegionById(level.region)?.title || 'Region'}</p>
            <h2>${level.title}</h2>
          </div>
        </div>
        <div class="quest-stat-group">
          <div class="quest-stat">💎 ${state.collections.themeFragments}</div>
          <div class="quest-stat">🪙 ${state.coins}</div>
          <div class="quest-stat">❤️ ${state.lives}</div>
        </div>
      </section>

      <section class="quest-fit-wrapper">
        <div class="panel quest-fit-status-row">
          <span>⏱️ ${formatTime(state.timeSeconds)}</span>
          <span>💡 ${state.hintCount}/${MAX_HINTS_PER_LEVEL}</span>
          <span>❌ ${state.mistakes}</span>
          <span>🏆 ${liveScore}</span>
          <span>${'★'.repeat(starsEarned)}${'☆'.repeat(3 - starsEarned)}</span>
          <span>${stageProgress}%</span>
        </div>

        <section class="quest-fit-main">
          <aside class="quest-side-actions left">
            <button class="quest-tool-card compact" data-action="check-board">
              <span>✅</span>
              <strong>Check</strong>
            </button>
            <button class="quest-tool-card compact" data-action="reset-level">
              <span>🔄</span>
              <strong>Reset</strong>
            </button>
            <button class="quest-tool-card compact ${state.pencilMode ? 'active' : ''}" data-action="toggle-pencil">
              <span>✏️</span>
              <strong>Notes ${state.pencilMode ? 'ON' : 'OFF'}</strong>
            </button>
          </aside>

          <section class="quest-board-stack">
            <section class="panel board-panel quest-board-panel">
              ${renderSudokuBoard()}
            </section>

            <section class="panel quest-number-panel compact">
              <div class="quest-number-grid compact">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => `
                  <button class="quest-number-btn compact" data-action="number" data-value="${number}">${formatValue(number, state.theme, fruitIcons, colorLabels)}</button>
                `).join('')}
              </div>
            </section>
          </section>

          <aside class="quest-side-actions right">
            <button class="quest-tool-card compact" data-action="clear-cell">
              <span>🧽</span>
              <strong>Erase</strong>
            </button>
            <button class="quest-tool-card compact" data-action="undo">
              <span>↩️</span>
              <strong>Undo</strong>
            </button>
            <button class="quest-tool-card compact" disabled>
              <span>↪️</span>
              <strong>Redo</strong>
            </button>
            <button class="quest-tool-card compact" data-action="hint" ${state.hintCount >= MAX_HINTS_PER_LEVEL ? 'disabled' : ''}>
              <span>💡</span>
              <strong>Hint</strong>
            </button>
            <button class="quest-tool-card compact" data-action="check-level">
              <span>🏁</span>
              <strong>Selesai</strong>
            </button>
          </aside>
        </section>

        <section class="panel message-panel quest-message-panel compact">
          <p>${state.message}</p>
        </section>
      </section>
    </div>
  `
}

function renderSudokuBoard() {
  const errorSet = new Set(state.errors)
  const hint = state.hintPattern
  const moveFeedback = state.moveFeedback
  return `
    <div class="board-grid">
      ${state.board
        .map((value, index) => {
          const active = state.selectedCell === index ? 'selected' : ''
          const fixed = state.fixed[index] ? 'fixed' : ''
          const invalid = errorSet.has(index) ? 'invalid' : ''
          const row = getRow(index)
          const col = getCol(index)
          const box = getBox(index)
          const hintTarget = hint && hint.index === index ? 'hint-target' : ''
          const hintLine = hint && (hint.row === row || hint.col === col) && hint.index !== index ? 'hint-line' : ''
          const hintBox = hint && hint.box === box && hint.index !== index ? 'hint-box' : ''
          const hintSameValue = hint && value > 0 && value === hint.value && hint.index !== index ? 'hint-same-value' : ''
          const moveClass = moveFeedback?.index === index ? `move-${moveFeedback.status}` : ''
          const display = formatValue(value, state.theme, fruitIcons, colorLabels)
          return `
            <div class="cell ${active} ${fixed} ${invalid} ${hintTarget} ${hintLine} ${hintBox} ${hintSameValue} ${moveClass}" data-action="select-cell" data-value="${index}">
              <input
                class="cell-input"
                data-index="${index}"
                value="${value > 0 ? display : ''}"
                ${fixed ? 'readonly' : ''}
                placeholder="" />
            </div>
          `
        })
        .join('')}
    </div>
  `
}

function renderResultScreen() {
  const isQuizResult = state.lastReward?.mode === 'quiz'
  const isPuzzleResult = state.lastReward?.mode === 'puzzle'
  const nextLevelId = !isQuizResult && !isPuzzleResult ? getNextLevelId(state.selectedLevel) : null
  const stars = isQuizResult || isPuzzleResult ? 0 : (state.levelStars[state.selectedLevel] || 0)
  const reward = state.lastReward || { coins: 0, stars, crystal: null, xp: 0, fragment: 0 }
  const wrongAnswers = reward.quizSummary?.wrongAnswers || []
  return `
    <div class="page">
      <section class="panel result-card">
        <div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <h2>${isQuizResult ? 'Quiz Challenge Selesai!' : (isPuzzleResult ? 'Puzzle Quest Selesai!' : 'Level Selesai!')}</h2>
        <p>${state.message}</p>
        <div class="reward-grid">
          ${renderRewardItem('Coin', `+${reward.coins}`)}
          ${renderRewardItem('Score', `${reward.score || 0}`)}
          ${renderRewardItem('Star', `+${reward.stars}`)}
          ${renderRewardItem('XP', `+${reward.xp}`)}
          ${renderRewardItem('Crystal', reward.crystal || '-')}
        </div>
        <div class="result-info">
          ${isQuizResult
            ? `
              <div><span>Skor</span><strong>${reward.quizSummary.correctCount}/${reward.quizSummary.total}</strong></div>
              <div><span>Salah</span><strong>${wrongAnswers.length}</strong></div>
              <div><span>Hint Sisa</span><strong>${reward.quizSummary.hintsLeft}</strong></div>
            `
            : isPuzzleResult
              ? `
                <div><span>Waktu</span><strong>${formatTime(reward.puzzleSummary.time)}</strong></div>
                <div><span>Piece</span><strong>${reward.puzzleSummary.piecesPlaced}/9</strong></div>
                <div><span>Hint Dipakai</span><strong>${reward.puzzleSummary.hintsUsed}</strong></div>
              `
              : `
                <div><span>Waktu</span><strong>${formatTime(state.timeSeconds)}</strong></div>
                <div><span>Kesalahan</span><strong>${state.mistakes}</strong></div>
                <div><span>Hint</span><strong>${state.hintCount}</strong></div>
              `
          }
        </div>
        ${isQuizResult ? renderQuizMistakeReview(wrongAnswers) : ''}
        ${shouldOfferMiniGame() ? `
          <div class="mini-offer">
            <strong>Bonus Mini Game terbuka</strong>
            <p>Main 15-30 detik untuk coin, XP, dan theme fragment.</p>
            <div class="mini-game-row">
              ${miniGames.map(game => `<button class="button mini outline" data-action="start-mini" data-mini="${game.id}">${game.title}</button>`).join('')}
            </div>
          </div>
        ` : ''}
        <div class="button-grid">
          <button class="button primary" data-action="goto" data-value="${isQuizResult || isPuzzleResult ? 'challenge' : 'story'}">${isQuizResult || isPuzzleResult ? 'Kembali ke Challenge' : 'Kembali ke Peta'}</button>
          <button class="button secondary" data-action="${isQuizResult ? 'start-quiz-challenge' : (isPuzzleResult ? 'start-puzzle-quest' : 'play-level')}" data-level="${state.selectedLevel}">Main Lagi</button>
          ${nextLevelId ? `<button class="button secondary" data-action="play-level" data-level="${nextLevelId}">Level Berikutnya</button>` : ''}
        </div>
      </section>
    </div>
  `
}

function renderQuizMistakeReview(wrongAnswers) {
  if (!wrongAnswers.length) {
    return `
      <section class="quiz-review-block success">
        <h3>Review Jawaban</h3>
        <p>Perfect! Tidak ada jawaban salah di challenge ini.</p>
      </section>
    `
  }

  return `
    <section class="quiz-review-block">
      <h3>Lihat Salahnya Di Mana</h3>
      <div class="quiz-review-list">
        ${wrongAnswers.map((item, index) => `
          <article class="quiz-review-item">
            <strong>${index + 1}. ${item.question}</strong>
            <p>Jawabanmu: <span>${item.selected}${item.skipped ? ' (dilewati)' : ''}</span></p>
            <p>Kunci benar: <span>${item.answer}</span></p>
          </article>
        `).join('')}
      </div>
    </section>
  `
}

function renderRewardItem(label, value) {
  return `
    <div class="reward-item">
      <span>${label}</span>
      <strong>${value}</strong>
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
          <h2>Achievement Room</h2>
        </div>
        <img class="room-dino" src="${dinoUrl}" alt="Dino companion" />
      </section>
      <section class="panel room-switcher">
        <button class="button mini primary" data-action="goto" data-value="achievement">Badge</button>
        <button class="button mini outline" data-action="goto" data-value="collection">Collection</button>
      </section>
      <section class="achievement-grid">
        ${achievements
          .map(achievement => {
            const unlocked = state.achievements.has(achievement.id)
            return `
              <button class="achievement-card ${unlocked ? 'active' : 'locked'}" data-action="open-achievement" data-value="${unlocked ? achievement.title : ''}">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                <span class="pill ${unlocked ? 'green' : 'muted'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
              </button>
            `
          })
          .join('')}
      </section>
      <section class="panel message-panel">
        <p>${state.message}</p>
      </section>
    </div>
  `
}

function renderCollectionScreen() {
  return `
    <div class="page collection-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Collection Room</p>
          <h2>Koleksi Petualangan</h2>
        </div>
        <img class="room-dino" src="${dinoUrl}" alt="Dino companion" />
      </section>
      
      <section class="panel collection-section">
        <h3>🦖 Dino Evolution</h3>
        <div class="evolution-track">
          <div class="evolution-item ${state.dino.level >= 1 ? 'unlocked' : 'locked'}">
            <span class="evolution-icon">🐣</span>
            <strong>Baby Dino</strong>
            <small>Lv. 1</small>
          </div>
          <div class="evolution-arrow ${state.dino.level >= 5 ? 'active' : ''}">→</div>
          <div class="evolution-item ${state.dino.level >= 5 ? 'unlocked' : 'locked'}">
            <span class="evolution-icon">🦕</span>
            <strong>Explorer</strong>
            <small>Lv. 5</small>
          </div>
          <div class="evolution-arrow ${state.dino.level >= 10 ? 'active' : ''}">→</div>
          <div class="evolution-item ${state.dino.level >= 10 ? 'unlocked' : 'locked'}">
            <span class="evolution-icon">🦖</span>
            <strong>Adventure</strong>
            <small>Lv. 10</small>
          </div>
          <div class="evolution-arrow ${state.dino.level >= 15 ? 'active' : ''}">→</div>
          <div class="evolution-item ${state.dino.level >= 15 ? 'unlocked' : 'locked'}">
            <span class="evolution-icon">✨</span>
            <strong>Crystal</strong>
            <small>Lv. 15</small>
          </div>
        </div>
        <div class="evolution-level">
          <p>Current: <strong>${getDinoEvolutionLabel()} - Level ${state.dino.level}</strong></p>
          <div class="xp-bar">
            <div class="xp-progress" style="width: ${getDinoXpPercent()}%"></div>
          </div>
          <small>${getDinoXpPercent()}% to next level</small>
        </div>
      </section>

      <section class="panel collection-section">
        <h3>🎨 Theme Modes</h3>
        <div class="collection-grid">
          ${themes.map(theme => {
            const owned = state.collections.themes.has(theme.id)
            const isActive = state.theme === theme.id
            return `
              <button class="collection-card ${owned ? 'owned' : 'locked'} ${isActive ? 'active' : ''}" 
                      data-action="select-theme" data-theme="${theme.id}"
                      title="${theme.description}">
                <span class="card-icon">${theme.icon}</span>
                <strong>${theme.label}</strong>
                <p>${isActive ? '✓ Aktif' : (owned ? 'Dimiliki' : '🔒 Belum')}</p>
              </button>
            `
          }).join('')}
          <article class="collection-card ${state.collections.themeFragments > 0 ? 'owned' : ''}">
            <span class="card-icon">✨</span>
            <strong>Fragment</strong>
            <p>${state.collections.themeFragments} × Theme Fragment</p>
          </article>
        </div>
      </section>

      <section class="panel collection-section">
        <h3>💎 Crystal Collection</h3>
        <div class="collection-grid">
          ${regions.map(region => {
            const story = regionStory[region.id]
            const owned = state.crystals.has(region.id)
            return `
              <button class="collection-card ${owned ? 'owned' : 'locked'}" 
                      data-action="view-crystal" data-crystal="${region.id}"
                      title="${story.title}">
                <span class="card-icon card-large">${story.icon}</span>
                <strong>${story.crystal}</strong>
                <p>${owned ? story.title : '🔒 Belum Didapat'}</p>
              </button>
            `
          }).join('')}
        </div>
      </section>

      <section class="panel collection-section">
        <h3>🎁 Daily Rewards</h3>
        <div class="daily-rewards-grid">
          ${dailyRewards.map((reward, idx) => {
            const day = idx + 1
            const claimed = state.collections.dailyLoginClaimed ? new Date(state.collections.dailyLoginClaimed).toDateString() === new Date().toDateString() : false
            return `
              <div class="reward-card">
                <div class="reward-day">Day ${day}</div>
                <div class="reward-content">
                  <span class="reward-icon">${reward.icon}</span>
                  <strong>${reward.reward}</strong>
                </div>
                ${!claimed && state.collections.dailyStreak === day ? 
                  `<button class="button mini primary reward-claim" data-action="claim-daily">Claim</button>` 
                  : 
                  `<span class="reward-status">${claimed && state.collections.dailyStreak === day ? '✓' : ''}</span>`
                }
              </div>
            `
          }).join('')}
        </div>
        <p class="reward-streak">Streak: <strong>${state.collections.dailyStreak}/7</strong></p>
      </section>

      <section class="panel collection-section">
        <h3>🎒 Treasures</h3>
        <div class="treasure-display">
          <div class="treasure-count">
            <span class="treasure-icon">🎁</span>
            <div>
              <strong>${state.collections.treasureChests}</strong>
              <p>Treasure Chests Unlocked</p>
            </div>
          </div>
          ${state.collections.treasureChests > 0 ? 
            `<button class="button primary" data-action="open-treasure">Open Treasure</button>` 
            : 
            `<p style="color: var(--muted);">Complete 5 levels to unlock treasures</p>`
          }
        </div>
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
  const activeSkin = dinoSkins.find(skin => skin.id === state.dino.skin) || dinoSkins[0]
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
        <div class="profile-avatar-large">
          <img class="profile-dino-img" src="${dinoUrl}" alt="${activeSkin.label}" />
        </div>
        <div class="profile-summary">
          ${state.editingProfile ? `
            <label class="profile-input-row">
              <span>Nama Player</span>
              <input class="profile-input" data-action="profile-name" value="${state.profileNameDraft || ''}" placeholder="Masukkan nama baru" />
            </label>
            <div class="button-grid">
              <button class="button mini outline" data-action="cancel-profile">Batal</button>
              <button class="button mini primary" data-action="save-profile">Simpan</button>
            </div>
          ` : `
            <strong>${state.username}</strong>
            <p>${activeSkin.label}</p>
            <p style="font-size: 0.9rem; color: var(--muted); margin: 4px 0;">${getDinoEvolutionLabel()}</p>
          `}
          <div class="profile-level-chip">Dino Level ${state.dino.level}</div>
          <div class="xp-row">
            <span>XP</span>
            <strong>${getDinoXpPercent()}%</strong>
          </div>
          <div class="xp-bar">
            <div class="xp-progress" style="width: ${getDinoXpPercent()}%"></div>
          </div>
        </div>
      </section>
      <section class="panel profile-stats-grid">
        ${renderProfileStat('Coins', state.coins, '💰')}
        ${renderProfileStat('Treasures', state.collections.treasureChests, '🎁')}
        ${renderProfileStat('Crystals', state.crystals.size, '💎')}
        ${renderProfileStat('Streak', state.collections.dailyStreak, '🔥')}
      </section>
      <section class="panel profile-item-card">
        <div class="item-header">
          <p class="eyebrow">Quick Links</p>
          <strong>Akses Koleksi</strong>
        </div>
        <div class="button-grid">
          <button class="button outline" data-action="goto" data-value="collection">📚 Collection</button>
          <button class="button outline" data-action="goto" data-value="shop">🛍️ Shop</button>
          <button class="button outline" data-action="goto" data-value="achievement">🏆 Badges</button>
          <button class="button outline" data-action="goto" data-value="menu">← Home</button>
        </div>
      </section>
      <section class="panel profile-action-row">
        <button class="button outline" data-action="edit-profile">Ubah Nama</button>
        <button class="button outline" data-action="goto" data-value="collection">Collection</button>
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
        ${renderSettingCard('Music', state.musicEnabled ? 'Musik latar aktif.' : 'Musik latar dimatikan.', state.musicEnabled ? 'Matikan' : 'Hidupkan', 'music-toggle')}
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
      <section class="panel">
        <h3>Theme Warna</h3>
        <div class="swatch-grid">
          ${colorThemes.map(ct => `
            <button class="theme-swatch ${state.theme === ct.id ? 'active' : ''}" data-action="change-theme" data-theme="${ct.id}" style="background:${ct.color}"></button>
          `).join('')}
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
              <div class="theme-preview-small">
                ${renderSmallPreview(theme.id)}
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
    <div class="page login-fantasy-page">
      <section class="login-fantasy-scene">
        <button class="login-fantasy-back" data-action="goto" data-value="settings" aria-label="Kembali">←</button>

        <article class="login-fantasy-card">
          <img class="login-fantasy-logo" src="${logoUrl}" alt="Sudoku Adventure" />
          <h2>LOGIN</h2>

          <label class="login-fantasy-field">
            <span class="login-fantasy-icon">👤</span>
            <input
              class="login-fantasy-input"
              data-action="login-input"
              value="${state.loginDraft}"
              placeholder="Masukkan nama kamu"
              autocomplete="username" />
          </label>

          <button class="login-fantasy-submit" data-action="login">LOGIN</button>
        </article>

        <img class="login-fantasy-dino" src="${dinoUrl}" alt="Dino mascot" />
        <aside class="login-fantasy-sign">LET'S<br />SOLVE<br />THE PUZZLE!</aside>
      </section>
    </div>
  `
}

function renderStoryPopup() {
  const popup = state.storyPopup
  return `
    <div class="story-popup">
      <div class="story-popup-card">
        <div class="unlock-burst">${popup.icon}</div>
        <p class="eyebrow">Area Story Complete</p>
        <h2>${popup.region.title} Unlocked</h2>
        <p>${popup.title}</p>
        <div class="crystal-reward">
          <span>${popup.icon}</span>
          <strong>${popup.crystal}</strong>
        </div>
        <button class="button primary" data-action="close-popup">Ambil Crystal</button>
      </div>
    </div>
  `
}

function renderTreasurePopup() {
  if (!state.treasurePopup) return ''
  const rewards = state.treasurePopup.rewards
  return `
    <div class="treasure-popup">
      <div class="treasure-card">
        <div class="treasure-animation">🎁</div>
        <h2>Treasure Chest!</h2>
        <p>Peti hadiah terbuka!</p>
        <div class="treasure-reward">
          <p class="reward-text">${rewards ? `Hadiah: ${rewards.coin} 🪙, ${rewards.hint} 💡, ${rewards.fragment} ✨` : 'Dapatkan coin, hint, dan hadiah spesial!'}</p>
        </div>
        <button class="button primary" data-action="claim-treasure">Terima Hadiah</button>
      </div>
    </div>
  `
}

function renderPurchaseSuccess() {
  return `
    <div class="modal-overlay purchase-success-overlay">
      <div class="purchase-success panel">
        <div class="success-emoji">✅</div>
        <p>${state.purchaseSuccess?.message || 'Pembelian berhasil'}</p>
      </div>
    </div>
  `
}

function renderDailyRewardPopup() {
  const daily = state.dailyRewardPopup
  const todayClaimed = state.collections.dailyLoginClaimed === getTodayKey()
  const amount = daily?.amount ? `+${daily.amount}` : daily?.reward || ''
  return `
    <div class="modal-overlay dr-overlay">
      <div class="dr-card">
        <button class="dr-close" data-action="close-daily-popup">✕</button>
        <div class="dr-head">
          <div class="dr-gift">🎁</div>
          <h3>Daily Reward</h3>
          <p>Day ${daily.day} of 7</p>
        </div>
        <div class="dr-days">
          ${dailyRewards.map((reward, idx) => {
            const day = idx + 1
            const active = day === daily.day
            const done = day < daily.day
            return `
              <div class="dr-day ${active ? 'active' : ''} ${done ? 'done' : ''}">
                <span>${reward.icon}</span>
                <small>${day}</small>
              </div>
            `
          }).join('')}
        </div>
        <div class="dr-today">
          <p>TODAY'S REWARD</p>
          <strong>${daily.icon} ${amount}</strong>
          <span>${daily.reward}</span>
        </div>
        ${todayClaimed
          ? '<button class="dr-claim" disabled>✅ SUDAH DIKLAIM</button>'
          : '<button class="dr-claim" data-action="claim-daily">🎉 CLAIM REWARD</button>'}
      </div>
    </div>
  `
}

function renderPuzzleCompletePopup() {
  const popup = state.puzzleCompletePopup
  if (!popup) return ''
  return `
    <div class="overlay popup-overlay" data-action="noop">
      <article class="popup-card puzzle-complete-popup">
        <h3>${popup.title}</h3>
        <p>Reward didapat:</p>
        <div class="puzzle-complete-reward-row">
          <span>🪙 ${popup.coins}</span>
          <span>💎 ${popup.gems}</span>
          <span>⭐ ${popup.xp} XP</span>
        </div>
      </article>
    </div>
  `
}

function renderSmallPreview(themeId) {
  const previewNums = [1,2,3,4,5,6,7,8,9]
  return `
    <div class="small-preview">
      <div class="small-grid">
        ${previewNums.map(n => `<div class="small-cell">${formatValue(n, themeId, fruitIcons, colorLabels)}</div>`).join('')}
      </div>
    </div>
  `
}

function renderMiniGameScreen() {
  const game = getActiveMiniGame()
  const progressValue = getMiniGameProgress(game)
  const progress = Math.min(100, Math.round((progressValue / game.target) * 100))

  if (game.id === 'fruit-puzzle') {
    return `
      <div class="page mini-game-page">
        <section class="panel header-panel">
          <button class="icon-action" data-action="goto" data-value="result">←</button>
          <div>
            <p class="eyebrow">Bonus Mini Game</p>
            <h2>${game.title}</h2>
          </div>
          <div class="tag">${progressValue}/${game.target}</div>
        </section>
        <section class="panel mini-game-stage mini-puzzle-stage" style="--mini-puzzle-image:url('${game.imageUrl || puzzleArtUrl}')">
          <div class="mini-puzzle-top">
            <p>${game.reward}</p>
            <button class="button mini outline" data-action="mini-puzzle-hint" ${(game.hintsLeft || 0) <= 0 ? 'disabled' : ''}>Hint ${(game.hintsLeft || 0)}</button>
          </div>

          <div class="daily-progress">
            <div class="daily-progress-fill" style="width: ${progress}%"></div>
          </div>

          <section class="mini-puzzle-board" aria-label="Mini puzzle board">
            ${game.answerGrid.map((piece, index) => {
              const filled = game.placedGrid[index]
              const pieceNumber = filled ? Number(filled) : Number(piece)
              const col = ((pieceNumber - 1) % 3) * 50
              const row = Math.floor((pieceNumber - 1) / 3) * 50
              return `
                <button
                  class="mini-puzzle-slot ${filled ? 'filled' : ''}"
                  data-action="mini-puzzle-place"
                  data-value="${index}"
                  style="--piece-col:${col}%;--piece-row:${row}%;"
                  aria-label="Slot ${index + 1}">
                </button>
              `
            }).join('')}
          </section>

          <section class="mini-puzzle-tray" aria-label="Mini puzzle tray">
            ${game.tray.map((piece, index) => {
              const pieceNumber = Number(piece)
              const col = ((pieceNumber - 1) % 3) * 50
              const row = Math.floor((pieceNumber - 1) / 3) * 50
              return `
                <button
                  class="mini-puzzle-piece ${game.selectedPiece === index ? 'selected' : ''}"
                  data-action="mini-puzzle-select"
                  data-value="${index}"
                  style="--piece-col:${col}%;--piece-row:${row};"
                  aria-label="Potongan ${pieceNumber}">
                </button>
              `
            }).join('')}
          </section>
        </section>
      </div>
    `
  }

  return `
    <div class="page mini-game-page">
      <section class="panel header-panel">
        <button class="icon-action" data-action="goto" data-value="result">←</button>
        <div>
          <p class="eyebrow">Bonus Mini Game</p>
          <h2>${game.title}</h2>
        </div>
        <div class="tag">${game.time || 20}s</div>
      </section>
      <section class="panel mini-game-stage ${game.id}">
        <button class="mini-target" data-action="mini-click">
          ${game.id === 'crystal-catch' ? 'CRYSTAL' : game.id === 'memory-dino' ? 'CARD' : 'DINO'}
        </button>
        <p>${game.reward}</p>
        <div class="daily-progress">
          <div class="daily-progress-fill" style="width: ${progress}%"></div>
        </div>
        <strong>${progressValue}/${game.target}</strong>
      </section>
    </div>
  `
}

function renderMiniGamesSelectScreen() {
  return `
    <div class="page mini-games-select-page">
      <section class="panel mini-games-header">
        <button class="icon-action" data-action="goto" data-value="menu">←</button>
        <div>
          <p class="eyebrow">Permainan Seru</p>
          <h2>Mini Games</h2>
        </div>
      </section>
      
      <section class="mini-games-container">
        ${miniGames.map(game => `
          <div class="mini-game-card" data-game-id="${game.id}">
            <div class="mini-game-icon">
              ${game.id === 'dino-chase' ? '🦖' : game.id === 'crystal-catch' ? '💎' : game.id === 'memory-dino' ? '🎴' : '🧩'}
            </div>
            <h3>${game.title}</h3>
            <p class="mini-game-desc">${game.reward}</p>
            <button class="button mini-play" data-action="start-mini" data-mini="${game.id}">Main Sekarang</button>
          </div>
        `).join('')}
      </section>

      <section class="panel mini-games-info">
        <div class="info-icon">💡</div>
        <p>Mainkan mini games untuk mendapatkan coins dan hints untuk Sudoku!</p>
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
