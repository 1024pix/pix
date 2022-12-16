import Model, { attr, hasMany } from '@ember-data/model';

export default class OldArea extends Model {
  @attr() title;
  @attr() code;
  @attr() color;

  @hasMany('old-competence') competences;

  get sortedCompetences() {
    return this.competences.sortBy('index');
  }
}
