import DS from 'ember-data';

export default DS.Model.extend({
  status: DS.attr('string'),
  code: DS.attr('string'),
});
