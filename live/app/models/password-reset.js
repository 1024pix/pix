import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  temporaryKey: DS.attr('string')
});
