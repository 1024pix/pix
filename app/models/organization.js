import DS from 'ember-data';

const { attr } = DS;

export default DS.Model.extend({

  // Props
  name: attr(),
  type: attr(),
  code: attr(),
  logoUrl: attr(),

});
