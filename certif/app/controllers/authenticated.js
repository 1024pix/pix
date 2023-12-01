import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';

export default class AuthenticatedController extends Controller {
  @tracked isBannerVisible = true;
  @service router;
  @service currentUser;

  get showBanner() {
    const isOnFinalizationPage = this.router.currentRouteName === 'authenticated.sessions.finalize';
    return (
      this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents &&
      this.isBannerVisible &&
      !isOnFinalizationPage &&
      !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted
    );
  }

  get displayRoleManagementBanner() {
    return (
      this.currentUser.currentAllowedCertificationCenterAccess.isPro ||
      this.currentUser.currentAllowedCertificationCenterAccess.isSup
    );
  }

  get documentationLink() {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents) {
      return LINK_SCO;
    }
    return LINK_OTHER;
  }

  get showLinkToSessions() {
    return !this.currentUser.currentAllowedCertificationCenterAccess.isAccessRestricted;
  }

  @action
  async changeCurrentCertificationCenterAccess(certificationCenterAccess) {
    this.currentUser.updateCurrentCertificationCenter(certificationCenterAccess.id);
    this.router.replaceWith('authenticated');
  }
}
