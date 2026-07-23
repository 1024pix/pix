import Model, { attr } from '@warp-drive/legacy/model';

export default class Activity extends Model {
  @attr('string') level;
}
