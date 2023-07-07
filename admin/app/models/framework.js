import Model, { attr, hasMany } from '@ember-data/model';

export default class Framework extends Model {
  @attr('string') name;
  @attr('boolean') isCore;
  @hasMany('area') areas;
}
