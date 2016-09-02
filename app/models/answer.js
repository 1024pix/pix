import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({

  value: attr('string'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge')

});
