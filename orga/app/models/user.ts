import type { LegalDocumentStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Membership from './membership';
import type UserOrgaSetting from './user-orga-setting';

export default class User extends Model {
  declare [Type]: 'user';

  @attr<StringTransform>('string') declare email: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare password: string | null;
  @attr<StringTransform>('string') declare lang: string | null;
  @attr<BooleanTransform>('boolean') declare cgu: boolean | null;
  @attr<StringTransform>('string') declare pixOrgaTermsOfServiceStatus: LegalDocumentStatus | null;

  @hasMany<Membership>('membership', { async: true, inverse: 'user' }) declare memberships: AsyncHasMany<Membership>;

  @belongsTo<UserOrgaSetting>('user-orga-setting', { async: true, inverse: 'user' })
  declare userOrgaSettings: AsyncBelongsTo<UserOrgaSetting>;
}
