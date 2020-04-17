import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';
const _ = require('lodash');
import ENV from 'mon-pix/config/environment';

export default class WarningBanner extends Component {
  _bannerContent = ENV.APP.WARNING_BANNER_CONTENT;

  get displayBanner() {
    return !_.isEmpty(this._bannerContent);
  }

  get htmlSafeBannerContent() {
    return htmlSafe(this._bannerContent);
  }
}
