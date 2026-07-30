import Model, { attr } from '@warp-drive/legacy/model';

export default class ModuleMetadata extends Model {
  @attr('string') title;
  @attr('string') link;
  @attr('string') duration;
}
