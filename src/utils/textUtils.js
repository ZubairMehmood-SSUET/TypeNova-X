/**
 * textUtils.js
 * Pure functions for generating and handling typing test text.
 * No React dependencies — safe to call anywhere.
 *
 * Phase 4A: Added WORD_POOLS (easy/medium/hard) and difficulty-aware generators.
 * All Phase 3 exports remain unchanged and fully compatible.
 */

// ── Word pools ────────────────────────────────────────────────────────────────

/** Easy: short, high-frequency words (avg 3–4 chars) */
const EASY_WORDS = [
  'the', 'a', 'is', 'in', 'it', 'of', 'to', 'and', 'be', 'we',
  'at', 'on', 'do', 'go', 'he', 'me', 'my', 'no', 'or', 'so',
  'up', 'us', 'if', 'as', 'by', 'an', 'am', 'you', 'for', 'are',
  'was', 'but', 'not', 'all', 'can', 'had', 'her', 'his', 'how',
  'man', 'new', 'one', 'our', 'out', 'say', 'see', 'she', 'use',
  'way', 'who', 'did', 'get', 'has', 'him', 'now', 'old', 'two',
  'any', 'day', 'end', 'far', 'got', 'let', 'may', 'own', 'put',
  'run', 'set', 'top', 'try', 'ask', 'big', 'few', 'off', 'red',
  'sat', 'six', 'ten', 'yes', 'yet', 'ago', 'boy', 'cut', 'dog',
  'eye', 'fly', 'hot', 'hit', 'job', 'leg', 'lot', 'low', 'map',
]

/** Medium: common words (avg 4–6 chars) — original COMMON_WORDS pool */
const MEDIUM_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
  'large', 'often', 'hand', 'high', 'place', 'hold', 'turn', 'move', 'live',
  'where', 'much', 'through', 'long', 'down', 'should', 'every', 'found',
  'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between',
  'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city',
  'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw',
  'far', 'sea', 'draw', 'left', 'late', 'run', 'while', 'press', 'close',
  'night', 'real', 'life', 'few', 'north', 'open', 'seem', 'together',
  'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease',
  'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'book',
  'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second',
  'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever',
  'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body',
  'dog', 'family', 'song', 'measure', 'door', 'product', 'black', 'short',
  'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship',
  'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece',
  'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space',
  'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred', 'five',
  'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest',
  'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel',
]

/** Hard: longer, less common, and punctuation-adjacent words (avg 6–10 chars) */
const HARD_WORDS = [
  'algorithm', 'abstraction', 'Byzantine', 'coefficient', 'cryptography',
  'dissonance', 'equilibrium', 'fractal', 'gregarious', 'hypothesis',
  'idiosyncratic', 'jurisdiction', 'knowledgeable', 'labyrinthine', 'metamorphosis',
  'nomenclature', 'obfuscation', 'perpetuate', 'quintessential', 'reverberate',
  'sophisticated', 'trajectory', 'unambiguous', 'vulnerability', 'wavelength',
  'xerography', 'yielding', 'zealous', 'abbreviated', 'benchmark',
  'catastrophic', 'deliberate', 'eloquence', 'facilitate', 'governance',
  'hemorrhage', 'illuminate', 'juxtapose', 'kinesthetic', 'legitimate',
  'manipulation', 'navigation', 'observatory', 'perfunctory', 'qualitative',
  'resilience', 'sustainable', 'theoretical', 'unequivocal', 'verification',
  'widespread', 'exacerbate', 'formidable', 'gregarious', 'heuristic',
  'immutable', 'jeopardize', 'kaleidoscope', 'labyrinth', 'meticulous',
  'negligible', 'orchestrate', 'paramount', 'quantifiable', 'referendum',
  'scrutinize', 'tangential', 'ubiquitous', 'vicarious', 'whimsical',
  'xenophobia', 'yearning', 'zephyr', 'accentuate', 'biometric',
  'circumstantial', 'disproportionate', 'extemporaneous', 'fluctuating',
  'hierarchical', 'imperceptible', 'juggernaut', 'logarithmic', 'manifestation',
  'nonchalant', 'ostracize', 'proliferate', 'quarantine', 'retrospective',
  'simultaneous', 'triangulate', 'unprecedented', 'variable', 'withstanding',
  'cryptographic', 'infrastructure', 'authorization', 'authentication',
  'implementation', 'configuration', 'orchestration', 'visualization',
  'asynchronous', 'synchronization', 'decomposition', 'encapsulation',
  'polymorphism', 'refactoring', 'inheritance', 'instantiation', 'recursion',
]

/**
 * Public map of difficulty → word array.
 * External consumers (e.g. DifficultySelector) can reference this.
 */
export const WORD_POOLS = {
  easy:   EASY_WORDS,
  medium: MEDIUM_WORDS,
  hard:   HARD_WORDS,
}

/** Difficulty metadata used by UI components */
export const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: 'green',  description: 'Short common words' },
  medium: { label: 'Medium', color: 'purple', description: 'Everyday vocabulary' },
  hard:   { label: 'Hard',   color: 'pink',   description: 'Complex & technical' },
}

// ── Quotes (unchanged) ────────────────────────────────────────────────────────
const QUOTES = {
  short: [
    'the quick brown fox jumps over the lazy dog and then runs back across the field',
    'to be or not to be that is the question worth asking every single day',
    'all that glitters is not gold often have you heard that told to be true',
    'in the middle of every difficulty lies opportunity if you look hard enough',
    'the only way to do great work is to love what you do every moment',
  ],
  medium: [
    'the greatest glory in living lies not in never falling but in rising every time we fall and that is the truth about the human spirit which never gives up',
    'in the end it is not the years in your life that count it is the life in your years that truly matters and defines who you are',
    'the future belongs to those who believe in the beauty of their dreams and are willing to work hard every single day to make them come true',
    'success is not final failure is not fatal it is the courage to continue that counts and separates those who achieve from those who give up',
    'it does not matter how slowly you go as long as you do not stop moving forward toward the goal you set for yourself at the very start',
  ],
  long: [
    'code is like humor when you have to explain it it is no longer funny and the best code is code that reads like a well written story where every variable name and function tells you exactly what it does without any need for comments at all',
    'the programmers of tomorrow are the wizards of the future you are going to look like you have magic powers compared to everybody else and the best part about being a programmer is that you can create anything you can imagine with nothing but a keyboard and your mind',
    'there are two ways of constructing a software design one way is to make it so simple that there are obviously no deficiencies and the other way is to make it so complicated that there are no obvious deficiencies the first method is far more difficult',
    'any fool can write code that a computer can understand but good programmers write code that humans can understand and that is the fundamental difference between a junior developer who just gets things done and a senior developer who thinks about maintainability',
  ],
}

// ── Generators ─────────────────────────────────────────────────────────────────

/**
 * Build a randomised string of `count` words from the given difficulty pool.
 * @param {number} count
 * @param {'easy'|'medium'|'hard'} [difficulty='medium']
 * @returns {string}
 */
export function generateWordText(count, difficulty = 'medium') {
  const pool = WORD_POOLS[difficulty] ?? WORD_POOLS.medium
  const words = []
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return words.join(' ')
}

/**
 * Return a random quote string for the given length category.
 * Quotes are difficulty-agnostic — they use their own pool.
 * @param {'short'|'medium'|'long'} len
 * @returns {string}
 */
export function generateQuoteText(len = 'medium') {
  const pool = QUOTES[len] ?? QUOTES.medium
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Generate text appropriate for a time-based test.
 * @param {number} seconds  Test duration
 * @param {'easy'|'medium'|'hard'} [difficulty='medium']
 * @returns {string}
 */
export function generateTimeText(seconds, difficulty = 'medium') {
  const targetWords = Math.ceil((seconds / 60) * 220)
  return generateWordText(targetWords, difficulty)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Split a text string into an array of character objects.
 * @param {string} text
 * @returns {{ char: string, status: 'pending'|'correct'|'error'|'extra' }[]}
 */
export function buildCharMap(text) {
  return text.split('').map((char) => ({ char, status: 'pending' }))
}

/**
 * Return the display label for a mode option.
 * @param {'time'|'words'|'quote'} mode
 * @param {number|string} option
 * @returns {string}
 */
export function formatOptionLabel(mode, option) {
  if (mode === 'time')  return `${option}s`
  if (mode === 'words') return `${option}w`
  return String(option)
}
