import Model, { attr } from '@warp-drive/legacy/model';

export default class IsCertifiable extends Model {
  @attr('boolean') isCertifiable;
  @attr('number') certifiableCompetencesCount;
  @attr('number') minimumCertifiableCompetencesForCertificability;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr doubleCertificationEligibility;
}
