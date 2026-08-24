import Model, { attr } from '@warp-drive/legacy/model';

export default class AttachableTargetProfile extends Model {
  @attr('string') name;
}
