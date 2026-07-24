import Model, { attr } from '@warp-drive/legacy/model';

export default class ExternalUserAuthenticationRequest extends Model {
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() username;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() password;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() externalUserToken;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() expectedUserId;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() accessToken;
}
