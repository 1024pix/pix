import DS from 'ember-data';

const { belongsTo } = DS;

export default DS.Model.extend({

  // Props
  
  // Relationships
  organization: belongsTo('organization' ),
  user: belongsTo('user')

});
