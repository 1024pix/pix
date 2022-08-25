import Model, { attr, hasMany } from '@ember-data/model';

export default class NewCompetence extends Model {
  @attr() name;
  @attr() index;

  @hasMany('new-thematic') thematics;

  get sortedThematics() {
    return this.thematics.sortBy('index');
  }
}
