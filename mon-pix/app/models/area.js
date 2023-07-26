import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  // attributes
  @attr('string') name;
  @attr('string') title;
  @attr('number') code;
  @attr('string') color;

  // includes
  @hasMany('resultCompetence', { async: true, inverse: 'area' }) resultCompetences;
  @hasMany('competence', { async: true, inverse: 'area' }) competences;

  get sortedCompetences() {
    return this.competences.sortBy('code');
  }
}
