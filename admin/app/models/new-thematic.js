import Model, { attr, hasMany } from '@ember-data/model';

export default class NewThematic extends Model {
  @attr() name;
  @attr() index;

  @hasMany('new-tube') tubes;

  get sortedTubes() {
    return this.tubes.sortBy('practicalTitle');
  }
}
