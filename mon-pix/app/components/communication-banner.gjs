import { PixBannerAlert } from '@1024pix/nebulix-ember';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import ENV from 'mon-pix/config/environment';
import textWithMultipleLang from 'mon-pix/helpers/text-with-multiple-lang';

export default class CommunicationBanner extends Component {
  <template>
    {{#if this.isEnabled}}
      <PixBannerAlert @type={{this.bannerType}}>
        {{textWithMultipleLang this.bannerContent}}
      </PixBannerAlert>
    {{/if}}
  </template>
  bannerType = ENV.APP.BANNER_TYPE;

  _rawBannerContent = ENV.APP.BANNER_CONTENT;

  get isEnabled() {
    return !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
  }

  get bannerContent() {
    return htmlSafe(this._rawBannerContent);
  }
}
