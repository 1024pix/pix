import Model, { attr, hasMany } from '@ember-data/model';
import sortBy from 'lodash/sortBy';

export default class Area extends Model {
  // attributes
  @attr('string') name;
  @attr('string') title;
  @attr('number') code;
  @attr('string') color;

  // includes
  @hasMany('resultCompetence', { async: false, inverse: 'area' }) resultCompetences;
  @hasMany('competence', { async: false, inverse: 'area' }) competences;

  get sortedCompetences() {
    return sortBy(this.competences, 'code');
  }
}
