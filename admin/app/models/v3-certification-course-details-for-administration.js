import Model, { attr } from '@ember-data/model';
export default class V3CertificationCourseDetailsForAdministration extends Model {
  @attr() certificationCourseId;
  @attr() certificationChallengesForAdministration;
  version = 3;
}
