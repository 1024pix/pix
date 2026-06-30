export function getVersionNumber(date = new Date()) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getSeconds())
  );
}

function pad(n) {
  return String(n).padStart(2, '0');
}
