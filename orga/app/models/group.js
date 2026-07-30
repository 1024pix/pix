import Model, { attr } from '@warp-drive/legacy/model';

export default class Group extends Model {
  @attr('string') name;
}
