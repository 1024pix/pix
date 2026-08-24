import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import sortBy from 'lodash/sortBy';

export default class Area extends Model {
  @attr() title;
  @attr() code;
  @attr() color;
  @attr() frameworkId;

  @hasMany('competence', { async: true, inverse: null }) competences;

  get sortedCompetences() {
    return sortBy(this.hasMany('competences').value(), 'index');
  }
}
