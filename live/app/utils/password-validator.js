export default function isPasswordValid(password) {
  if (!password) {
    return false;
  }
  const pattern = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&-]{8,}/;
  return pattern.test(password.trim());
}
