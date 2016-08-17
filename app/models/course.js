import DS from 'ember-data';

export default DS.Model.extend({

  name: DS.attr('string'),
  description: DS.attr('string'),
  duration: DS.attr('number'),
  imageUrl: DS.attr('string')

});
