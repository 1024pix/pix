import Model, { attr, hasMany } from '@ember-data/model';

export default class Tube extends Model {
  @attr('string') name;
  @attr('number') index;

  @hasMany('tube') tubes;
}
