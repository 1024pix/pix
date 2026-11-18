import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import parseISODateOnly from 'mon-pix/utils/parse-iso-date-only';

export default class FormatISODate extends Helper {
  @service intl;

  compute([date], { format }) {
    const parsedDate = parseISODateOnly(date);
    if (!parsedDate) {
      return '';
    }
    return this.intl.formatDate(parsedDate, { format });
  }
}
