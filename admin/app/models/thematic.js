import Model, { attr, hasMany } from '@ember-data/model';

export default class Thematic extends Model {
  @attr() name;
  @attr() index;

  @hasMany('trigger-tube', { async: true, inverse: null }) triggerTubes;
  @hasMany('tube', { async: true, inverse: null }) tubes;
}
