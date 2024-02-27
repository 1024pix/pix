import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') color;

  @hasMany('competence', { async: true, inverse: null }) competences;

  get sortedCompetences() {
    return this.competences.slice().sort((a, b) => {
      return a.index - b.index;
    });
  }
}
