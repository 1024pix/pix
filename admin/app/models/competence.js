import Model, { attr, hasMany } from '@ember-data/model';

export default class Competence extends Model {
  @attr() name;
  @attr() index;

  @hasMany('thematic', { async: true, inverse: null }) thematics;

  get sortedThematics() {
    return this.hasMany('thematics').value().sortBy('index');
  }
}
