import Model, { attr } from '@ember-data/model';

export default class IsCertifiable extends Model {
  @attr('boolean') isCertifiable;
  @attr() cleaCertificationEligible;
  @attr() pixPlusDroitMaitreCertificationEligible;
  @attr() pixPlusDroitExpertCertificationEligible;
  @attr() pixPlusEduInitieCertificationEligible;
  @attr() pixPlusEduConfirmeCertificationEligible;
  @attr() pixPlusEduAvanceCertificationEligible;
  @attr() pixPlusEduExpertCertificationEligible;
}
