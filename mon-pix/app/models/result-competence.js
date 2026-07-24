import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class ResultCompetence extends Model {
  // attributes
  @attr('string') name;
  @attr('number') index;
  @attr('number') level;

  // includes
  @belongsTo('area', { async: true, inverse: 'resultCompetences' }) area;
}
