import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/nl';
import 'dayjs/locale/es';

import Service from '@ember/service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(utc);

export default class DayjsService extends Service {
  self(date, format) {
    return format ? dayjs(date, format) : dayjs(date);
  }

  utc(date) {
    return dayjs.utc(date);
  }

  setLocale(locale) {
    dayjs.locale(locale);
  }
}
