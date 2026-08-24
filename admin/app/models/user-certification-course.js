import Model, { attr } from '@warp-drive/legacy/model';

export default class UserCertificationCourse extends Model {
  @attr('date') createdAt;
  @attr('boolean') isPublished;
  @attr() sessionId;
}
