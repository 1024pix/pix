export default function isEmailValid(email) {
  if (!email) {
    return false;
  }
  // From http://stackoverflow.com/a/46181/5430854
  const emailPattern =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return emailPattern.test(email.trim());
}
