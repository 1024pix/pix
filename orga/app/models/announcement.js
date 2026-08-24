import Model, { attr } from '@warp-drive/legacy/model';

export default class Announcement extends Model {
  @attr() content;
}
