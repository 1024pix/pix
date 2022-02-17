import Model, { attr } from '@ember-data/model';

export default class MemberModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
