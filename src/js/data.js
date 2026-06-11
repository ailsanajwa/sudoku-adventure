export const themes = [
  { id: 'classic', label: 'Classic Number', description: 'Angka Sudoku standar dengan warna pastel.', icon: '1️⃣' },
  { id: 'fruit', label: 'Fruit Mode', description: 'Angka berubah menjadi buah lucu.', icon: '🍓' },
  { id: 'color', label: 'Color Mode', description: 'Angka diberi warna ceria.', icon: '🎨' }
]

export const achievements = [
  { id: 'no-mistake', title: 'No Mistake Run', description: 'Selesaikan level tanpa kesalahan.' },
  { id: 'fast-solver', title: 'Fast Solver', description: 'Selesaikan level dalam waktu singkat.' },
  { id: 'logic-master', title: 'Logic Master', description: 'Gunakan 3 hint atau lebih secara cerdas.' },
  { id: 'perfect-player', title: 'Perfect Player', description: 'Dapatkan 3 bintang di semua level awal.' }
]

const puzzleA = [
  0, 0, 0, 2, 6, 0, 7, 0, 1,
  6, 8, 0, 0, 7, 0, 0, 9, 0,
  1, 9, 0, 0, 0, 4, 5, 0, 0,
  8, 2, 0, 1, 0, 0, 0, 4, 0,
  0, 0, 4, 6, 0, 2, 9, 0, 0,
  0, 5, 0, 0, 0, 3, 0, 2, 8,
  0, 0, 9, 3, 0, 0, 0, 7, 4,
  0, 4, 0, 0, 5, 0, 0, 3, 6,
  7, 0, 3, 0, 1, 8, 0, 0, 0
]

const solutionA = [
  4, 3, 5, 2, 6, 9, 7, 8, 1,
  6, 8, 2, 5, 7, 1, 4, 9, 3,
  1, 9, 7, 8, 3, 4, 5, 6, 2,
  8, 2, 6, 1, 9, 5, 3, 4, 7,
  3, 7, 4, 6, 8, 2, 9, 1, 5,
  9, 5, 1, 7, 4, 3, 6, 2, 8,
  5, 1, 9, 3, 2, 6, 8, 7, 4,
  2, 4, 8, 9, 5, 7, 1, 3, 6,
  7, 6, 3, 4, 1, 8, 2, 5, 9
]

const puzzleB = [
  0, 0, 0, 2, 6, 0, 7, 0, 1,
  6, 8, 0, 0, 7, 0, 0, 9, 0,
  1, 9, 0, 0, 0, 4, 5, 0, 0,
  8, 2, 0, 1, 0, 0, 0, 4, 0,
  0, 0, 4, 6, 0, 2, 9, 0, 0,
  0, 5, 0, 0, 0, 3, 0, 2, 8,
  0, 0, 9, 3, 0, 0, 0, 7, 4,
  0, 4, 0, 0, 5, 0, 0, 3, 6,
  7, 0, 3, 0, 1, 8, 0, 0, 0
]

const solutionB = [
  4, 3, 5, 2, 6, 9, 7, 8, 1,
  6, 8, 2, 5, 7, 1, 4, 9, 3,
  1, 9, 7, 8, 3, 4, 5, 6, 2,
  8, 2, 6, 1, 9, 5, 3, 4, 7,
  3, 7, 4, 6, 8, 2, 9, 1, 5,
  9, 5, 1, 7, 4, 3, 6, 2, 8,
  5, 1, 9, 3, 2, 6, 8, 7, 4,
  2, 4, 8, 9, 5, 7, 1, 3, 6,
  7, 6, 3, 4, 1, 8, 2, 5, 9
]

export const levels = [
  {
    id: 'desert-1',
    title: 'Sunset Dunes',
    region: 'desert',
    icon: '🌵',
    description: 'Mulai petualangan di padang pasir yang hangat.',
    story: 'Dino berjalan di bawah matahari sore, mencari oasis yang menyimpan teka-teki pertama.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 14
  },
  {
    id: 'desert-2',
    title: 'Golden Oasis',
    region: 'desert',
    icon: '🏜️',
    description: 'Temukan oasis tersembunyi dengan teka-teki sehat.',
    story: 'Di oasis berkilau, setiap angka menuntun Dino melewati pasir emas.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 16
  },
  {
    id: 'forest-1',
    title: 'Cozy Clearing',
    region: 'forest',
    icon: '🌲',
    description: 'Suasana hutan lembut dan musik alam.',
    story: 'Dino tiba di lapangan teduh di antara pohon-pohon, diiringi dengung lebah dan angin.',
    puzzle: puzzleB,
    solution: solutionB,
    targetStars: 3,
    coinReward: 16
  },
  {
    id: 'forest-2',
    title: 'Misty Grove',
    region: 'forest',
    icon: '🍃',
    description: 'Tantangan baru di bawah kanopi daun.',
    story: 'Kabut tipis mengelilingi jalur, sementara Dino memakai insting untuk menemukan pola tersembunyi.',
    puzzle: puzzleB,
    solution: solutionB,
    targetStars: 3,
    coinReward: 18
  },
  {
    id: 'mountain-1',
    title: 'Crystal Peaks',
    region: 'mountain',
    icon: '⛰️',
    description: 'Panaskan logika di puncak berduri.',
    story: 'Angin dingin bertiup di puncak, dan Dino harus menata angka seperti kristal di langit.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 18
  },
  {
    id: 'mountain-2',
    title: 'Snowy Ridge',
    region: 'mountain',
    icon: '❄️',
    description: 'Level dingin dengan strategi hangat.',
    story: 'Jejak Dino menancap di salju putih saat ia memecahkan teka-teki dingin dengan hati yang hangat.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 20
  },
  {
    id: 'snow-1',
    title: 'Glacier Gate',
    region: 'snow',
    icon: '❄️',
    description: 'Salju gemerlap dan teka-teki es.',
    story: 'Gerbang glasial terbuka, dan Dino harus mengurai pola beku di dalam kabut.',
    puzzle: puzzleB,
    solution: solutionB,
    targetStars: 3,
    coinReward: 22
  },
  {
    id: 'snow-2',
    title: 'Frozen Lake',
    region: 'snow',
    icon: '⛄',
    description: 'Puzzle beku dengan strategi penuh hati.',
    story: 'Di tepi danau beku, Dino menyalakan cahaya untuk memecahkan teka-teki kristal.',
    puzzle: puzzleB,
    solution: solutionB,
    targetStars: 3,
    coinReward: 24
  },
  {
    id: 'castle-1',
    title: 'Mystery Gate',
    region: 'castle',
    icon: '🏰',
    description: 'Masuki kastil misterius dengan clue tersembunyi.',
    story: 'Gerbang kastil terbuka perlahan saat Dino mendekati teka-teki yang menunggu di dalamnya.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 26
  },
  {
    id: 'castle-2',
    title: 'Crystal Throne',
    region: 'castle',
    icon: '🔮',
    description: 'Pertarungan akhir melawan teka-teki Crystal.',
    story: 'Dino berdiri di hadapan takhta kristal untuk menutup petualangan dengan jawaban cemerlang.',
    puzzle: puzzleA,
    solution: solutionA,
    targetStars: 3,
    coinReward: 28
  }
]

export const regions = [
  {
    id: 'desert',
    title: 'Desert',
    subtitle: 'Warna pasir, bintang, dan tantangan hangat.',
    story: 'Dino kecil menjejak di bukit pasir berbisik dan mencari oasis tersembunyi.',
    icon: '🌵',
    levels: ['desert-1', 'desert-2']
  },
  {
    id: 'forest',
    title: 'Forest',
    subtitle: 'Hutan cozy penuh buah dan misteri.',
    story: 'Di bawah kanopi hijau, setiap teka-teki bersinar seperti permata daun.',
    icon: '🌲',
    levels: ['forest-1', 'forest-2']
  },
  {
    id: 'mountain',
    title: 'Mountain',
    subtitle: 'Gunung megah dengan teka-teki puncak.',
    story: 'Awan tipis dan jalur batu menantangmu menyusun angka di atas ketinggian.',
    icon: '⛰️',
    levels: ['mountain-1', 'mountain-2']
  },
  {
    id: 'snow',
    title: 'Snow Area',
    subtitle: 'Lembah beku dan petualangan kristal dingin.',
    story: 'Jejak kaki Dino tersapu salju, sementara kristal es memancarkan teka-teki baru.',
    icon: '❄️',
    levels: ['snow-1', 'snow-2']
  },
  {
    id: 'castle',
    title: 'Mystery Castle',
    subtitle: 'Kastil tersembunyi penuh teka-teki dan hadiah.',
    story: 'Gerbang megah terbuka untuk petualang yang berani menaklukkan misteri tua.',
    icon: '🏰',
    levels: ['castle-1', 'castle-2']
  }
]

export const levelOrder = levels.map(level => level.id)

export function getLevelById(id) {
  return levels.find(level => level.id === id)
}

export function getRegionById(id) {
  return regions.find(region => region.id === id)
}

export function getNextLevelId(currentId) {
  const index = levelOrder.indexOf(currentId)
  return index >= 0 && index + 1 < levelOrder.length ? levelOrder[index + 1] : null
}

export function getThemeData(themeId) {
  return themes.find(theme => theme.id === themeId) || themes[0]
}
