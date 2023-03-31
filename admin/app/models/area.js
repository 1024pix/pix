import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  @attr() title;
  @attr() code;
  @attr() color;
  @attr() frameworkId;

  @hasMany('competence') competences;

  get sortedCompetences() {
    return this.competences.sortBy('index');
  }
}
