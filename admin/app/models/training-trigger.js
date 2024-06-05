import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class TrainingTrigger extends Model {
  @attr('string') type;
  @attr('number') threshold;
  @attr('number') tubesCount;

  @belongsTo('training', { async: true, inverse: 'trainingTriggers' }) training;
  @hasMany('area', { async: true, inverse: null }) areas;
}
