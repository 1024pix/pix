import Model, { attr } from '@warp-drive/legacy/model';

export default class AnnouncementModel extends Model {
  @attr() content;
}
