import Model, { attr, hasMany } from '@ember-data/model';

export default class TrainingTrigger extends Model {
  @attr('string') type;
  @attr('number') trainingId;
  @attr('number') threshold;
  @attr('number') tubesCount;

  @hasMany('area') areas;
}
