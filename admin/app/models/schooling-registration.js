import Model, { attr, belongsTo } from '@ember-data/model';

export default class SchoolingRegistration extends Model {

  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() division;
  @attr() organizationId;
  @attr() organizationExternalId;
  @attr() organizationName;
  @attr() createdAt;
  @attr() updatedAt;

  @belongsTo('user') user;
}
