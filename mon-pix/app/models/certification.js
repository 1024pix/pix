import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Certification extends Model {

  static PARTNER_KEY_CLEA = 'PIX_EMPLOI_CLEA';
  // attributes
  @attr('date-only') birthdate;
  @attr('string') birthplace;
  @attr('string') certificationCenter;
  @attr('string') commentForCandidate;
  @attr('date') date;
  @attr('string') firstName;
  @attr('boolean') isPublished;
  @attr('string') lastName;
  @attr('number') pixScore;
  @attr('string') status;
  @attr() acquiredPartnerCertifications;

  // includes
  @belongsTo('resultCompetenceTree') resultCompetenceTree;
  @belongsTo('user') user;

  @computed('acquiredPartnerCertifications.[]')
  get hasCleaCertif() {
    return this.acquiredPartnerCertifications.includes(Certification.PARTNER_KEY_CLEA);
  }
}
