import Model, { attr } from '@ember-data/model';

export default class SchoolingRegistrationUserAssociation extends Model {
  // attributes
  @attr('date-only') birthdate;
  @attr('string') campaignCode;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') username;
  @attr('string') studentNumber;
}
