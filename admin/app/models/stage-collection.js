import Model, { hasMany } from '@ember-data/model';

export default class Stage extends Model {
  @hasMany('stage') stages;
}
