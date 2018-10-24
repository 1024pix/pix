import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({

  // Props
  role: attr(),

  // Relationships
  organization: belongsTo('organization'),
  user: belongsTo('user')

});
