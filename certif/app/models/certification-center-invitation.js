import { tracked } from '@glimmer/tracking';
import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationCenterInvitation extends Model {
  @tracked
  isResendingInvitation = false;

  @attr('string') email;
  @attr('string') status;
  @attr('date') updatedAt;
  @attr('string') certificationCenterName;
}
