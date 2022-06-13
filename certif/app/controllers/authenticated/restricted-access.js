import Controller from '@ember/controller';

export default class RestrictedAccessController extends Controller {
  get pixCertifScoBlockedAccessDateLycee() {
    return this.model.pixCertifScoBlockedAccessDateLycee;
  }

  get pixCertifScoBlockedAccessDateCollege() {
    return this.model.pixCertifScoBlockedAccessDateCollege;
  }

  get calendarScoLink() {
    return 'https://eduscol.education.fr/721/cadre-de-reference-des-competences-numeriques#summary-item-4';
  }
}
