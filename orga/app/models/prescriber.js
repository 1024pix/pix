import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  pixOrgaTermsOfServiceAccepted: DS.attr('boolean'),
  memberships: DS.hasMany('membership'),
  userOrgaSettings: DS.belongsTo('user-orga-setting'),

  fullName: computed('firstName', 'lastName', function() {
    return `${this.get('firstName')} ${this.get('lastName')}`;
  })
});
