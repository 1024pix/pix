import Model, { hasMany } from '@ember-data/model';

export default class StageCollection extends Model {
  @hasMany('stage') stages;
}
