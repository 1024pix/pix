import Helper from '@ember/component/helper';
import showdown from 'showdown';
import xss from 'xss';
import isArray from 'lodash/isArray';

export default class ConvertToHtml extends Helper {

  compute(args) {
    if (!isArray(args) || args.length <= 0) {
      return '';
    }

    const text = args[0];
    const filteredOutHtml = xss(text, {
      stripIgnoreTagBody: ['style'],
    });

    const converter = new showdown.Converter();
    return converter.makeHtml(filteredOutHtml);
  }
}
