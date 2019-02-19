import DS from 'ember-data';

const { attr, belongsTo } = DS;

export default DS.Model.extend({

  // Attributes
  name: attr(),

  // Relationships
  membership: belongsTo('membership'),

});
