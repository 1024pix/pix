import Model, { attr } from '@ember-data/model';

export const roles = { SUPER_ADMIN: 'SUPER_ADMIN', SUPPORT: 'SUPPORT', METIER: 'METIER', CERTIF: 'CERTIF' };

export default class AdminMember extends Model {
  @attr() userId;
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') email;
  @attr('string') role;

  @attr('boolean') isInEditionMode;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
