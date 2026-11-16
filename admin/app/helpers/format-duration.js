export default function formatDuration(milliseconds, format) {
  const isNegative = milliseconds < 0;
  const absMs = Math.abs(milliseconds);

  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
  const ms = absMs % 1000;

  const pad = (num, size = 2) => String(num).padStart(size, '0');

  const result = format
    .replace('DD', pad(days))
    .replace('D', days)
    .replace('HH', pad(hours))
    .replace('H', hours)
    .replace('mm', pad(minutes))
    .replace('m', minutes)
    .replace('ss', pad(seconds))
    .replace('s', seconds)
    .replace('SSS', pad(ms, 3))
    .replace('SS', pad(Math.floor(ms / 10)))
    .replace('S', Math.floor(ms / 100));

  return isNegative ? '-' + result : result;
}
