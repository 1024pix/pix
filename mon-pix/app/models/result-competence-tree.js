import Model, { hasMany } from '@ember-data/model';

export default class ResultCompetenceTree extends Model {

  // includes
  @hasMany('area', { inverse: null }) areas;
}
