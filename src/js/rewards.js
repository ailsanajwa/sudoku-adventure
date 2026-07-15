export function calculateStars(timeSeconds, mistakes) {
  if (mistakes === 0 && timeSeconds <= 120) return 3
  if (timeSeconds <= 240) return 2
  return 1
}

export function coinsForStars(stars) {
  return 10 + stars * 6
}

export function calculateScore(timeSeconds, hintCount, mistakes) {
  const speedScore = Math.max(180, 900 - timeSeconds * 2)
  const hintPenalty = hintCount * 45
  const mistakePenalty = mistakes * 60
  return Math.max(100, speedScore - hintPenalty - mistakePenalty)
}

export function checkAchievementProgress(state, result) {
  const earned = []
  if (!result.mistakes) earned.push('no-mistake')
  if (result.timeSeconds <= 90) earned.push('fast-solver')
  if (result.hintCount >= 3) earned.push('logic-master')
  if (result.stars === 3) earned.push('perfect-player')
  return earned
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
