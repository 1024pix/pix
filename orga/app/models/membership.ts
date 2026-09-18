import type { OrganizationRole } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Organization from './organization';
import type User from './user';

export default class Membership extends Model {
  declare [Type]: 'membership';

  @attr<StringTransform>('string') declare organizationRole: OrganizationRole | null;

  @belongsTo<User>('user', { async: true, inverse: 'memberships' }) declare user: AsyncBelongsTo<User>;

  @belongsTo<Organization>('organization', { async: true, inverse: null })
  declare organization: AsyncBelongsTo<Organization>;

  get isAdmin(): boolean {
    return this.organizationRole === 'ADMIN';
  }
}
