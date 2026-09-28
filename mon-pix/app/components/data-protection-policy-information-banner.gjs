import { PixBannerAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import isEmpty from 'lodash/isEmpty';
import ENV from 'mon-pix/config/environment';

export default class DataProtectionPolicyInformationBanner extends Component {
  <template>
    {{#if this.shouldDisplayDataProtectionPolicyInformation}}
      <PixBannerAlert
        @canCloseBanner={{true}}
        @onCloseBannerTriggerAction={{this.validateLastDataProtectionPolicy}}
        @actionLabel={{t "common.data-protection-policy-information-banner.url-label"}}
        @actionUrl={{this.dataProtectionPolicyUrl}}
      >
        {{t "common.data-protection-policy-information-banner.title"}}
      </PixBannerAlert>
    {{/if}}
  </template>
  @service session;
  @service currentUser;
  @service currentDomain;
  @service intl;
  @service url;

  bannerType = ENV.APP.BANNER_TYPE;
  _rawBannerContent = ENV.APP.BANNER_CONTENT;

  get shouldDisplayDataProtectionPolicyInformation() {
    if (!this.session.isAuthenticated) {
      return false;
    }

    const isCommunicationBannerDisplayed = !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
    if (isCommunicationBannerDisplayed) {
      return false;
    }

    return this.currentUser.user?.shouldSeeDataProtectionPolicyInformationBanner;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  @action
  async validateLastDataProtectionPolicy() {
    await this.currentUser.user.save({
      adapterOptions: { rememberUserHasSeenLastDataProtectionPolicyInformation: true },
    });
  }
}
