import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LINK_SCO = 'http://cloud.pix.fr/s/GqwW6dFDDrHezfS';
const LINK_OTHER = 'http://cloud.pix.fr/s/fLSG4mYCcX7GDRF';
const LINK_V3_PILOT = 'https://cloud.pix.fr/s/f2PNGLajBypbaiJ';

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

  get documentationLink() {
    if (this.currentUser.currentAllowedCertificationCenterAccess.isV3Pilot) {
      return LINK_V3_PILOT;
    }
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
