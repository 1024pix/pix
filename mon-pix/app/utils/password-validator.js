export default function isPasswordValid(password) {
  if (!password) {
    return false;
  }
  const pattern = new RegExp('^(?=.*[a-zà-ÿ])(?=.*[A-ZÀ-ß])(?=.*[0-9]).{8,}$');
  return pattern.test(password);
}
