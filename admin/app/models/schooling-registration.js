import Model, { attr, belongsTo } from '@ember-data/model';

export default class SchoolingRegistration extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() division;
  @attr() group;
  @attr() organizationId;
  @attr() organizationName;
  @attr() createdAt;
  @attr() updatedAt;
  @attr() isDisabled;
  @attr() canBeDissociated;

  @belongsTo('user') user;
}
