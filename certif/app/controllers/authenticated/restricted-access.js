import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class RestrictedAccessController extends Controller {
  @service router;
  @service currentUser;

  @action
  async changeCurrentCertificationCenterAccess(certificationCenterAccess) {
    this.currentUser.currentAllowedCertificationCenterAccess = certificationCenterAccess;
    this.router.replaceWith('authenticated');
  }

  get calendarScoLink() {
    return 'https://eduscol.education.fr/721/cadre-de-reference-des-competences-numeriques#summary-item-4';
  }
}
