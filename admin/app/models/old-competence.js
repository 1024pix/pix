import Model, { attr, hasMany } from '@ember-data/model';

export default class OldCompetence extends Model {
  @attr() name;
  @attr() index;

  @hasMany('old-tube') tubes;

  get sortedTubes() {
    return this.tubes.sortBy('practicalTitle');
  }
}
