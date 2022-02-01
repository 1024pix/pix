export default function generateRandomString(prefix) {
  const randomString = Math.random().toString().substr(2, 8);
  return prefix + randomString;
}
