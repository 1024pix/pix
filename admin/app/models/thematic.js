import Model, { attr, hasMany } from '@ember-data/model';

export default class Thematic extends Model {
  @attr('string') name;
  @attr() index;

  @hasMany('trigger-tube') triggerTubes;
  @hasMany('tube') tubes;
}
