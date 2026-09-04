import { config } from '../../../../../src/shared/config.js';

const INVIGILATOR_PASSWORD_LENGTH = 6;
const INVIGILATOR_PASSWORD_CHARS = '23456789bcdfghjkmpqrstvwxyBCDFGHJKMPQRSTVWXY!*?'.split('');

function sample(array) {
  const len = array == null ? 0 : array.length;
  return len ? array[Math.floor(Math.random() * len)] : undefined;
}

function _randomLetter() {
  const letters = config.availableCharacterForCode.letters.split('');
  return sample(letters);
}

function _randomNumberCharacter() {
  const numberCharacter = config.availableCharacterForCode.numbers.split('');
  return sample(numberCharacter);
}

export function generateSessionCode() {
  const code =
    '' +
    _randomLetter() +
    _randomLetter() +
    _randomLetter() +
    _randomLetter() +
    _randomNumberCharacter() +
    _randomNumberCharacter();
  return code;
}

export function generateInvigilatorPassword() {
  const chars = Array.from(INVIGILATOR_PASSWORD_CHARS);
  for (let i = INVIGILATOR_PASSWORD_LENGTH; i >= 0; i--) {
    const j = Math.floor(Math.random() * (chars.length - 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, INVIGILATOR_PASSWORD_LENGTH).join('');
}
