/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import capitalize from 'lodash/capitalize';

export const ACQUIRED = 'acquired';

export default class Certification extends Model {

  static PARTNER_KEY_CLEA = 'PIX_EMPLOI_CLEA';
  // attributes
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') birthplace;
  @attr('date') date;
  @attr('date') deliveredAt;
  @attr('boolean') isPublished;
  @attr('string') certificationCenter;
  @attr('string') commentForCandidate;
  @attr('number') pixScore;
  @attr('string') status;
  @attr('string') verificationCode;
  @attr() cleaCertificationStatus;
  @attr() certifiedBadgeImages;
  @attr('number') maxReachableLevelOnCertificationDate;

  // includes
  @belongsTo('resultCompetenceTree') resultCompetenceTree;
  @belongsTo('user') user;

  @computed('cleaCertificationStatus')
  get hasCleaCertif() {
    return this.cleaCertificationStatus === ACQUIRED;
  }

  @computed('certifiedBadgeImages.length', 'hasCleaCertif')
  get hasAcquiredComplementaryCertifications() {
    return this.hasCleaCertif || this.certifiedBadgeImages.length > 0;
  }

  @computed('firstName', 'lastName')
  get fullName() {
    return capitalize(this.firstName) + ' ' + capitalize(this.lastName);
  }

  get maxReachablePixCountOnCertificationDate() {
    return this.maxReachableLevelOnCertificationDate * 8 * 16;
  }
}
