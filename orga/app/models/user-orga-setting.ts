import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, belongsTo } from '@warp-drive/legacy/model';

import type Organization from './organization';
import type User from './user';

export default class UserOrgaSetting extends Model {
  declare [Type]: 'user-orga-setting';

  @belongsTo<User>('user', { async: true, inverse: 'userOrgaSettings' }) declare user: AsyncBelongsTo<User>;

  @belongsTo<Organization>('organization', { async: true, inverse: null })
  declare organization: AsyncBelongsTo<Organization>;
}
