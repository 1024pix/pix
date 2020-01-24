import DS from 'ember-data';
import { computed } from '@ember/object';
import { none } from '@ember/object/computed';

const { Model, attr } = DS;

export default class CertificationCandidate extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') birthCity;
  @attr('string') birthProvinceCode;
  @attr('string') birthCountry;
  @attr('string') email;
  @attr('string') externalId;
  @attr('number') extraTimePercentage;
  @attr('boolean') isLinked;
  @attr('number') certificationCourseId;
  @attr('string') examinerComment;
  @attr('boolean') hasSeenEndTestScreen;

  @none('certificationCourseId') isMissing;

  @computed('certificationCourseId')
  get readableCertificationCourseId() {
    if (this.certificationCourseId) {
      return this.certificationCourseId.toLocaleString();
    }
    return 'Aucun (absent)';
  }
}
