import DS from 'ember-data';
import { computed } from '@ember/object';
const { belongsTo, Model, attr, hasMany } = DS;

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('boolean') cgu;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.get('firstName')} ${this.get('lastName')}`;
  }
}
