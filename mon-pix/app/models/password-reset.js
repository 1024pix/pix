import DS from 'ember-data';

export default DS.Model.extend({
  password: DS.attr('string'),
  temporaryKey: DS.attr('string')
});
