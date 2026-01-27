import Service from '@ember/service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/nl';
import 'dayjs/locale/es';

const PLUGINS = {
  customParseFormat,
  localizedFormat,
  utc,
};

export default class DayjsService extends Service {
  constructor() {
    super(...arguments);
    dayjs.extend(customParseFormat);
    dayjs.extend(localizedFormat);
    dayjs.extend(utc);
  }

  extend(pluginName) {
    const plugin = PLUGINS[pluginName];
    if (plugin) {
      dayjs.extend(plugin);
    }
  }

  setLocale(locale) {
    dayjs.locale(locale);
  }

  self(date, format) {
    return format ? dayjs(date, format) : dayjs(date);
  }
}