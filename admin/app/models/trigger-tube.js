import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class TriggerTube extends Model {
  @attr('number') level;

  @belongsTo('tube', { async: false, inverse: null }) tube;
}
