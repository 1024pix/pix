import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class Competence extends Model {
  // attributes
  @attr('string') name;

  @belongsTo('area', { async: true, inverse: 'competences' }) area;
}
