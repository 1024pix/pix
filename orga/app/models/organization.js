import DS from 'ember-data';
import { equal } from '@ember/object/computed';

export default DS.Model.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  campaigns: DS.hasMany('campaign'),
  targetProfiles: DS.hasMany('target-profile'),
  memberships: DS.hasMany('membership'),
  organizationInvitations: DS.hasMany('organization-invitation'),
  students: DS.hasMany('student'),
  isManagingStudents: DS.attr('boolean'),

  isSco: equal('type', 'SCO'),
});
