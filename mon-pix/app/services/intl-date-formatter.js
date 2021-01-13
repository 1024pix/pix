import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class IntlDateFormatter extends Service {
  @service intl;

  formatDateStringToString(dateString) {
    if (!isDateStringValid(dateString)) {
      throw new Error(`Date "${dateString}" does not comply with the "YYYY-MM-DD" format`);
    }
    return this.intl.formatDate(
      toDateAtMidnightUTC(dateString),
      { format: 'LL', timeZone: 'UTC' },
    );
  }
}

function isDateStringValid(dateString) {
  const yearFormat = '\\d\\d\\d\\d'; // 4 digits
  const monthFormat = '(0[1-9]|1[0-2])'; // 2 digits between 01 and 12
  const dayFormat = '(0[1-9]|[12][0-9]|3[01])'; // 2 digits between 01 and 31
  return new RegExp(`${yearFormat}-${monthFormat}-${dayFormat}`).test(dateString);
}

function toDateAtMidnightUTC(dateString) {
  return new Date(dateString + 'T00:00:00Z');
}
