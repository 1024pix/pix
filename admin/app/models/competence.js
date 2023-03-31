import Model, { attr, hasMany } from '@ember-data/model';

export default class Competence extends Model {
  @attr() name;
  @attr() index;

  @hasMany('thematic') thematics;

  get sortedThematics() {
    return this.thematics.sortBy('index');
  }
}
