import Model, { hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class User extends Model {

  @attr() firstName;
  @attr() lastName;
  @attr() email;

  @hasMany('membership') memberships;

  @computed('firstName,lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
