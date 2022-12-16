import Model, { attr } from '@ember-data/model';

export default class MemberIdentityModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
