import DS from 'ember-data';

const { belongsTo } = DS;

export default DS.Model.extend({

  // Attributes

  // Relationships
  organization: belongsTo('organization'),
  user: belongsTo('user'),
  organizationRole: belongsTo('organization-role'),
});
