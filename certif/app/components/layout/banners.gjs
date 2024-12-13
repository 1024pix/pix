import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class Banners extends Component {
  @tracked isBannerVisible = true;
  @service session;
  @service router;
  @service currentUser;

  get shouldDisplaySCOInformationBanner() {
    const isOnFinalizationPage = this.router.currentRouteName === 'authenticated.sessions.finalize';

    return (
      this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      this.isBannerVisible &&
      !isOnFinalizationPage &&
      !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted
    );
  }

  get shouldDisplayLocaleNotSupportedBanner() {
    const localeNotSupported = this.session?.data?.localeNotSupported;
    const localeNotSupportedBannerClosed = this.session?.data?.localeNotSupportedBannerClosed;

    return localeNotSupported && !localeNotSupportedBannerClosed;
  }

  @action
  closeLocaleNotSupportedBanner() {
    this.session.updateDataAttribute('localeNotSupportedBannerClosed', true);
  }

  <template>
    {{#if this.shouldDisplaySCOInformationBanner}}
      <PixBannerAlert @canCloseBanner='true' class='banners'>
        {{t 'pages.sco.banner.information' htmlSafe=true}}
      </PixBannerAlert>
    {{/if}}

    {{#if this.shouldDisplayLocaleNotSupportedBanner}}
      <PixBannerAlert
        @type='information'
        @canCloseBanner='true'
        @onCloseBannerTriggerAction={{this.closeLocaleNotSupportedBanner}}
        class='banners'
      >
        {{t 'banners.language-availability.message'}}
      </PixBannerAlert>
    {{/if}}
  </template>
}
