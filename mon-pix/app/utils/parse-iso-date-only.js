export default function parseISODateOnly(dateString) {
  if (!isDateStringValid(dateString)) {
    throw new Error(`Date "${dateString}" does not comply with the "YYYY-MM-DD" format`);
  }
  return toDateAtMidnightLocalTime(dateString);
}

function isDateStringValid(dateString) {
  const yearFormat = '\\d\\d\\d\\d'; // 4 digits
  const monthFormat = '(0[1-9]|1[0-2])'; // 2 digits between 01 and 12
  const dayFormat = '(0[1-9]|[12][0-9]|3[01])'; // 2 digits between 01 and 31
  return new RegExp(`${yearFormat}-${monthFormat}-${dayFormat}`).test(dateString);
}

function toDateAtMidnightLocalTime(dateString) {
  return new Date(dateString + 'T00:00:00');
  // Manually, '2020-01-01' must stay '2020-01-01' and not become '2019-12-31' in Sao Paulo timezone for example
  // When the time zone offset is absent, date-only forms are interpreted as a UTC time and date-time forms are interpreted as local time.
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
}
