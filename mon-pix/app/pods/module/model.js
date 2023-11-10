import Model, { attr, hasMany } from '@ember-data/model';

export default class Module extends Model {
  @attr('string') title;

  @hasMany('grain') grains;
}
