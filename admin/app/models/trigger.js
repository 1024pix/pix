import Model, { attr, hasMany } from '@ember-data/model';

export default class Trigger extends Model {
  @attr('string') type;
  @attr('number') threshold;
  @hasMany('trigger-tube') triggerTubes;
}
