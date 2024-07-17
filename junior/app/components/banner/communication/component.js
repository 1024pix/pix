import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import ENV from 'junior/config/environment';
import isEmpty from 'lodash/isEmpty';

export default class BannerCommunication extends Component {
  bannerType = ENV.APP.BANNER_TYPE;

  _rawBannerContent = ENV.APP.BANNER_CONTENT;

  get isEnabled() {
    return !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
  }

  get bannerContent() {
    return htmlSafe(this._rawBannerContent);
  }
}
