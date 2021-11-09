import Model, { attr } from '@ember-data/model';

export default class CertificationCandidateForSupervising extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('number') extraTimePercentage;
  @attr('boolean') authorizedToStart;
}
