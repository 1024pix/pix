import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class Feedback extends Model {
  // attributes
  @attr('string') answer;
  @attr('string') category;
  @attr('string') content;

  // includes
  @belongsTo('assessment', { async: true, inverse: null }) assessment;
  @belongsTo('challenge', { async: true, inverse: null }) challenge;
}
