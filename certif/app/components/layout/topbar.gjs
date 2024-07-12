import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import UserLoggedMenu from '../user-logged-menu';

const ACTION_URL_FOR_INFORMATION_BANNER = 'https://cloud.pix.fr/s/GqwW6dFDDrHezfS';

export default class Topbar extends Component {
  @tracked isBannerVisible = true;
  @service session;
  @service router;
  @service currentUser;

  get showInformationBanner() {
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

  @action
  async changeCurrentCertificationCenterAccess(certificationCenterAccess) {
    this.currentUser.updateCurrentCertificationCenter(certificationCenterAccess.id);
    this.router.replaceWith('authenticated');
  }

  <template>
    <div class='main-content__topbar topbar'>
      <UserLoggedMenu @onCertificationCenterAccessChanged={{this.changeCurrentCertificationCenterAccess}} />
    </div>

    {{#if this.showInformationBanner}}
      <PixBanner
        @actionLabel={{t 'pages.sco.banner.url-label'}}
        @actionUrl={{ACTION_URL_FOR_INFORMATION_BANNER}}
        @canCloseBanner='true'
      >
        {{t 'pages.sco.banner.information'}}
      </PixBanner>
    {{/if}}

    {{#if this.shouldDisplayLocaleNotSupportedBanner}}
      <PixBanner
        @type='information'
        @canCloseBanner='true'
        @onCloseBannerTriggerAction={{this.closeLocaleNotSupportedBanner}}
      >
        {{t 'banners.language-availability.message'}}
      </PixBanner>
    {{/if}}
  </template>
}
