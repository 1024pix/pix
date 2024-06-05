import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  @attr() title;
  @attr() code;
  @attr() color;
  @attr() frameworkId;

  @hasMany('competence', { async: true, inverse: null }) competences;

  get sortedCompetences() {
    return this.hasMany('competences').value().sortBy('index');
  }
}
