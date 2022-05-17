import Model, { attr } from '@ember-data/model';

export default class AdminMember extends Model {
  @attr() userId;
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') email;
  @attr('string') role;
  @attr() isSuperAdmin;
  @attr() isCertif;
  @attr() isSupport;
  @attr() isMetier;

  @attr('boolean') isInEditionMode;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
