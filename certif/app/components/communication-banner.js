import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import ENV from 'pix-certif/config/environment';

export default class CommunicationBanner extends Component {
  bannerType = ENV.APP.BANNER.TYPE;

  _rawBannerContent = ENV.APP.BANNER.CONTENT;

  get isEnabled() {
    return !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
  }

  get bannerContent() {
    return htmlSafe(this._rawBannerContent);
  }
}
