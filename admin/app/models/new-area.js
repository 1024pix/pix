import Model, { attr, hasMany } from '@ember-data/model';

export default class NewArea extends Model {
  @attr() title;
  @attr() code;
  @attr() color;

  @hasMany('new-competence') competences;

  get sortedCompetences() {
    return this.competences.sortBy('index');
  }
}
