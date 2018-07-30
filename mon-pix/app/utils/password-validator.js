import XRegExp from 'xregexp';

export default function isPasswordValid(password) {
  if (!password) {
    return false;
  }
  const pattern = XRegExp('^(?=.*\\p{L})(?=.*\\d).{8,}$');
  return pattern.test(password);
}
