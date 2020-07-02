/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import capitalize from 'lodash/capitalize';

export const ACQUIRED = 'acquired';

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
  @attr() cleaCertificationStatus;
  @attr() deliveredAt;

  // includes
  @belongsTo('resultCompetenceTree') resultCompetenceTree;
  @belongsTo('user') user;

  @computed('cleaCertificationStatus')
  get hasCleaCertif() {
    return this.cleaCertificationStatus === ACQUIRED;
  }

  @computed('firstName', 'lastName')
  get fullName() {
    return capitalize(this.firstName) + ' ' + capitalize(this.lastName);
  }
}
