import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationCenterInvitationResponse extends Model {
  @attr('string') code;
  @attr('string') email;
}
