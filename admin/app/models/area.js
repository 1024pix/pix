import Model, { attr, hasMany } from '@ember-data/model';

export default class Area extends Model {
  @attr() title;
  @attr() code;
  @attr() color;
  @attr() frameworkId;

  @hasMany('competence') competences;

  get sortedCompetences() {
    const competences = this.competences.map((c) => c);

    return competences.sort((a, b) => {
      return a.index.split('.')[1] - b.index.split('.')[1];
    });
  }
}
