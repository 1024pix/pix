import DS from 'ember-data';
import { computed } from '@ember/object';
const { belongsTo, Model, attr, hasMany } = DS;

export default class Prescriber extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') pixOrgaTermsOfServiceAccepted;
  @hasMany('membership') memberships;
  @belongsTo('user-orga-setting') userOrgaSettings;

  @computed('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
