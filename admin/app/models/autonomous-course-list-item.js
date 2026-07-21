import Model, { attr } from '@warp-drive/legacy/model';

export default class AutonomousCourseListItem extends Model {
  @attr('string') name;
  @attr('date') createdAt;
  @attr('date') archivedAt;
}
