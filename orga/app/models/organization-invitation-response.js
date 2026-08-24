import Model, { attr } from '@warp-drive/legacy/model';

export default class OrganizationInvitationResponse extends Model {
  @attr('string') code;
  @attr('number') userId;
}
