import Model, { attr } from '@warp-drive/legacy/model';

export default class Progression extends Model {
  @attr('number') completionRate;
}
