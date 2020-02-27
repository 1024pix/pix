import DS from 'ember-data';
const { attr, Model } = DS;

export default Model.extend({

  // Attributes
  name: attr(),
  type: attr(),
  externalId: attr(),

});
