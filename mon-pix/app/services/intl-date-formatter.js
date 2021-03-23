import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class IntlDateFormatter extends Service {
  @service intl;

  formatDateStringToISO(dateString) {
    if (!isDateStringValid(dateString)) {
      throw new Error(`Date "${dateString}" does not comply with the "YYYY-MM-DD" format`);
    }
    return toDateWithBrowserOffset(dateString);
  }
}

function isDateStringValid(dateString) {
  const yearFormat = '\\d\\d\\d\\d'; // 4 digits
  const monthFormat = '(0[1-9]|1[0-2])'; // 2 digits between 01 and 12
  const dayFormat = '(0[1-9]|[12][0-9]|3[01])'; // 2 digits between 01 and 31
  return new RegExp(`${yearFormat}-${monthFormat}-${dayFormat}`).test(dateString);
}

function toDateWithBrowserOffset(dateString) {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Add timezoneOffset to date, cant be tested
  // Manually, '2020-01-01' must stay '2020-01-01' and not become '2019-12-31' in Sao Paulo timezone for example
  return date;
}
