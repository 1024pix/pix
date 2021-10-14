import Helper from '@ember/component/helper';
import showdown from 'showdown';
import xss from 'xss';
import isArray from 'lodash/isArray';

export default class ConvertToHtml extends Helper {
  compute(args) {
    if (!isArray(args) || args.length <= 0) {
      return '';
    }

    const converter = new showdown.Converter();
    const text = args[0];
    const rawHtml = converter.makeHtml(text);

    return xss(rawHtml, {
      stripIgnoreTagBody: ['style'],
    });
  }
}
