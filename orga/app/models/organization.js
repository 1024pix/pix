import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  campaigns: DS.hasMany('campaign'),
  targetProfiles: DS.hasMany('target-profile'),
  memberships: DS.hasMany('membership'),
  students: DS.hasMany('student'),
  isManagingStudents: DS.attr('boolean'),
});
