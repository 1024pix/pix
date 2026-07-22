import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

const SCO_ACCESS_SUSPENSION_DATE = new Date('2026-07-16T21:59:59Z');
const NON_BREAKING_SPACE = String.fromCharCode(160);

export default class Banners extends Component {
  @service router;
  @service currentUser;
  @service intl;

  get isBeforeScoAccessSuspensionDate() {
    return new Date() < SCO_ACCESS_SUSPENSION_DATE;
  }

  get scoAccessSuspensionDate() {
    return this.intl.formatDate(SCO_ACCESS_SUSPENSION_DATE, { format: 'LL' }).replaceAll(' ', NON_BREAKING_SPACE);
  }

  get shouldDisplaySCOInformationBanner() {
    const isOnFinalizationPage = this.router.currentRouteName === 'authenticated.sessions.finalize';
    return (
      this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      this.isBeforeScoAccessSuspensionDate &&
      !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted &&
      !isOnFinalizationPage
    );
  }

  <template>
    {{#if this.shouldDisplaySCOInformationBanner}}
      <PixBannerAlert @type='warning' @canCloseBanner={{false}} class='banners'>
        {{t 'pages.sco.banner.information' suspensionDate=this.scoAccessSuspensionDate htmlSafe=true}}
      </PixBannerAlert>
    {{/if}}
  </template>
}
