import Model, { attr } from '@ember-data/model';

export default class AdminOrganizationLearner extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() division;
  @attr() group;
  @attr() nationalStudentId;
  @attr() organizationId;
  @attr() organizationName;
  @attr() userId;
  @attr() updatedAt;
  @attr() isDisabled;
}
