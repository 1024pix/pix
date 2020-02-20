import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  password: DS.attr('string'),
  cgu: DS.attr('boolean'),
  pixOrgaTermsOfServiceAccepted: DS.attr('boolean'),
  memberships: DS.hasMany('membership'),
  userOrgaSettings: DS.belongsTo('user-orga-setting'),

  fullName: computed('firstName', 'lastName', function() {
    return `${this.get('firstName')} ${this.get('lastName')}`;
  })
});
