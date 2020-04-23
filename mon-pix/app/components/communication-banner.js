import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';
const _ = require('lodash');
import ENV from 'mon-pix/config/environment';

export default class CommunicationBanner extends Component {
  bannerType = ENV.APP.BANNER_TYPE;

  _rawBannerContent = ENV.APP.BANNER_CONTENT;
  _bannerTypes = {
    info: 'info',
    warning: 'warning',
    error: 'error'
  };

  get isEnabled() {
    return !_.isEmpty(this._rawBannerContent) && !_.isEmpty(this.bannerType);
  }

  get bannerContent() {
    return htmlSafe(this._rawBannerContent);
  }

  get isWarning() {
    return this.bannerType === this._bannerTypes.warning;
  }

  get isError() {
    return this.bannerType === this._bannerTypes.error;
  }
}
