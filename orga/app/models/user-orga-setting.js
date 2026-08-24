import Model, { belongsTo } from '@warp-drive/legacy/model';

export default class UserOrgaSetting extends Model {
  @belongsTo('user', { async: true, inverse: 'userOrgaSettings' }) user;
  @belongsTo('organization', { async: true, inverse: null }) organization;
}
