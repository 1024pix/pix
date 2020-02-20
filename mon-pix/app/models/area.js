import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  // attributes
  @attr('string') name;
  @attr('string') title;
  @attr('number') code;
  @attr('string') color;

  // includes
  @hasMany('competence') competences;
  @hasMany('resultCompetence') resultCompetences;
}
