import Model, { hasMany } from '@warp-drive/legacy/model';

export default class ResultCompetenceTree extends Model {
  // includes
  @hasMany('area', { async: false, inverse: null }) areas;
}
