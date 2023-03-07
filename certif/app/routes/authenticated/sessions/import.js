import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ImportRoute extends Route {
  @service featureToggles;
  @service router;
  @service currentUser;
  @service currentDomain;
  @service intl;

  beforeModel() {
    const { isMassiveSessionManagementEnabled } = this.featureToggles.featureToggles;

    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    if (
      !isMassiveSessionManagementEnabled ||
      this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents ||
      isOrgTldAndEnglishCurrentLanguage
    ) {
      return this.router.replaceWith('authenticated.sessions.list');
    }
  }

  resetController(controller) {
    controller.reset();
  }
}
