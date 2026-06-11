const SAVE_KEY = 'sudoku-adventure-smart-quest-save'

export const defaultProgress = {
  coins: 80,
  theme: 'classic',
  mode: 'story',
  darkMode: false,
  musicVolume: 0.45,
  unlockedLevels: ['desert-1'],
  levelStars: {},
  achievements: [],
  selectedRegion: 'desert',
  selectedLevel: 'desert-1',
  username: 'Dino Friend',
  stats: {
    played: 0,
    bestTime: null,
    accuracy: 0,
    totalPlaytime: 0,
    completedLevels: 0
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) {
      return { ...defaultProgress }
    }
    const saved = JSON.parse(raw)
    return {
      ...defaultProgress,
      ...saved,
      stats: {
        ...defaultProgress.stats,
        ...(saved.stats || {})
      }
    }
  } catch (error) {
    console.warn('Load progress failed:', error)
    return { ...defaultProgress }
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.warn('Save progress failed:', error)
  }
}
