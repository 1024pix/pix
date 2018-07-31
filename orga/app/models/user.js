import DS from 'ember-data';

export default DS.Model.extend({

  email: DS.attr('string'),
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  cgu: DS.attr('boolean'),
  organizationAccesses: DS.hasMany('organization-access')
});
