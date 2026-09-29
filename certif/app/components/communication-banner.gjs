import { PixBannerAlert } from '@1024pix/nebulix-ember';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import ENV from 'pix-certif/config/environment';
import textWithMultipleLang from 'pix-certif/helpers/text-with-multiple-lang';

export default class CommunicationBanner extends Component {
  bannerType = ENV.APP.BANNER.TYPE;

  _rawBannerContent = ENV.APP.BANNER.CONTENT;

  get isEnabled() {
    return !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
  }

  get bannerContent() {
    return htmlSafe(this._rawBannerContent);
  }

  <template>
    {{#if this.isEnabled}}
      <PixBannerAlert @type={{this.bannerType}} @canCloseBanner={{false}}>
        {{textWithMultipleLang this.bannerContent}}
      </PixBannerAlert>
    {{/if}}
  </template>
}
