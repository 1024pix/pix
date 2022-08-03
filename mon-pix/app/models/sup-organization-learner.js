import Model, { attr } from '@ember-data/model';

export default class SupOrganizationLearner extends Model {
  @attr('date-only') birthdate;
  @attr('string') campaignCode;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') studentNumber;
}
