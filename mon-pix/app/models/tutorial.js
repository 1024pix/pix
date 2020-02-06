import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({

  duration: attr('string'),
  format: attr('string'),
  link: attr('string'),
  source: attr('string'),
  title: attr('string'),
  tubeName: attr('string'),
  tubePracticalTitle: attr('string'),
  tubePracticalDescription: attr('string'),
  scorecard: belongsTo('scorecard'),

});
