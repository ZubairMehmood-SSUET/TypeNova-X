/**
 * VirtualKeyboard.jsx
 * Pure display component — no internal state, no side effects.
 *
 * Props:
 *   targetKey    {string}  The character the user needs to type next.
 *                          Used to highlight the "next expected" key.
 *   lastKeyEvent {object}  { key, correct, seq } from useTypingEngine.
 *                          Used for the "just pressed" flash.
 *   visible      {boolean} Mount/unmount toggle from parent.
 */

import './VirtualKeyboard.css'

// Full QWERTY layout — each entry is [displayLabel, keyValue]
// keyValue matches what KeyboardEvent.key produces for that physical key
const ROWS = [
  [
    ['`','`'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],
    ['6','6'],['7','7'],['8','8'],['9','9'],['0','0'],['-','-'],['=','='],
    ['⌫','Backspace'],
  ],
  [
    ['Tab','Tab'],['Q','q'],['W','w'],['E','e'],['R','r'],['T','t'],
    ['Y','y'],['U','u'],['I','i'],['O','o'],['P','p'],['[','['],
    [']',']'],['\\','\\'],
  ],
  [
    ['Caps','CapsLock'],['A','a'],['S','s'],['D','d'],['F','f'],['G','g'],
    ['H','h'],['J','j'],['K','k'],['L','l'],[';',';'],["'","'"],
    ['↵','Enter'],
  ],
  [
    ['Shift','Shift'],['Z','z'],['X','x'],['C','c'],['V','v'],['B','b'],
    ['N','n'],['M','m'],[',',','],['.','.'],['/','/'],[' Shift ','Shift'],
  ],
  [
    ['Space',' '],
  ],
]

// Keys that should render wider
const WIDE_KEYS = new Set(['Backspace','Tab','CapsLock','Enter','Shift',' Shift '])

export default function VirtualKeyboard({ targetKey, lastKeyEvent, visible }) {
  if (!visible) return null

  const pressedKey = lastKeyEvent?.key ?? ''
  const pressedCorrect = lastKeyEvent?.correct ?? true
  // Normalise target to lowercase for letter matching
  const normTarget = typeof targetKey === 'string' ? targetKey.toLowerCase() : ''

  return (
    <div className="vkb" aria-hidden="true">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="vkb__row">
          {row.map(([label, val]) => {
            const isTarget  = val === normTarget || (normTarget === ' ' && val === ' ')
            // Flash the key that was just pressed (by seq change in parent)
            const isPressed = pressedKey === val || (pressedKey === ' ' && val === ' ')
            const isWide    = WIDE_KEYS.has(label)
            const isSpecial = isWide

            let cls = 'vkb__key'
            if (isWide)    cls += ' vkb__key--wide'
            if (isSpecial) cls += ' vkb__key--special'
            if (isTarget)  cls += ' vkb__key--target'
            if (isPressed && isTarget)  cls += ' vkb__key--correct'
            if (isPressed && !isTarget) cls += ' vkb__key--wrong'
            if (val === ' ')            cls += ' vkb__key--space'

            return (
              <span key={val + label} className={cls}>
                {label}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
