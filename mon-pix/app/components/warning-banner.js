import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';
const _ = require('lodash');
import ENV from 'mon-pix/config/environment';

export default class WarningBanner extends Component {
  bannerType = ENV.APP.WARNING_BANNER_TYPE;

  _bannerContent = ENV.APP.WARNING_BANNER_CONTENT;
  _bannerTypes = {
    info: 'info',
    warn: 'warn',
    error: 'error'
  };

  get displayBanner() {
    return !_.isEmpty(this._bannerContent) && !_.isEmpty(this.bannerType);
  }

  get htmlSafeBannerContent() {
    return htmlSafe(this._bannerContent);
  }

  get isBannerTypeWarn() {
    return this.bannerType === this._bannerTypes.warn;
  }

  get isBannerTypeError() {
    return this.bannerType === this._bannerTypes.error;
  }
}
