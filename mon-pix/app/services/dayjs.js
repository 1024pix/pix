import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/nl';

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default class DayjsService extends Service {
  @tracked locale = dayjs.locale();

  setLocale(locale) {
    dayjs.locale(locale);
    this.locale = dayjs.locale();
  }

  format(date, outputFormat) {
    // Reading the tracked locale makes callers recompute when the locale changes

    this.locale;
    return dayjs(date).format(outputFormat);
  }

  humanizeDuration(value, unit) {
    this.locale;
    return dayjs.duration(value, unit).humanize();
  }
}
