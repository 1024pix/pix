import Model, { attr } from '@warp-drive/legacy/model';

export default class Stage extends Model {
  @attr('string') prescriberTitle;
  @attr('string') prescriberDescription;
  @attr('number') threshold;
}
