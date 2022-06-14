import Controller from '@ember/controller';

export default class RestrictedAccessController extends Controller {
  get certificationOpeningDate() {
    if (this.model.isAccessBlockedCollege) {
      return this.model.pixCertifScoBlockedAccessDateCollege;
    }

    if (this.model.isAccessBlockedLycee || this.model.isAccessBlockedAEFE || this.model.isAccessBlockedAgri) {
      return this.model.pixCertifScoBlockedAccessDateLycee;
    }

    return null;
  }

  get calendarScoLink() {
    return 'https://eduscol.education.fr/721/cadre-de-reference-des-competences-numeriques#summary-item-4';
  }
}
