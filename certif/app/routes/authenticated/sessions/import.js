import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ImportRoute extends Route {
  @service router;
  @service currentUser;
  @service currentDomain;
  @service intl;

  beforeModel() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.primaryLocale;
    const isOrgTldAndEnglishCurrentLanguage = topLevelDomain === 'org' && currentLanguage === 'en';

    if (
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
