import Model, { attr, hasMany } from '@ember-data/model';

export default class Framework extends Model {
  @attr('string') name;

  @hasMany('area') areas;
}
