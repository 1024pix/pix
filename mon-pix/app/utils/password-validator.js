import XRegExp from 'xregexp';

const pattern = XRegExp('^(?=.*\\p{L})(?=.*\\d).{8,}$');

export default function isPasswordValid(password) {
  return password ? pattern.test(password) : false;
}
