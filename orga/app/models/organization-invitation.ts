import type { OrganizationInvitationStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Organization from './organization';

export default class OrganizationInvitation extends Model {
  declare [Type]: 'organization-invitation';

  @attr<StringTransform>('string') declare email: string | null;
  @attr<StringTransform>('string') declare status: OrganizationInvitationStatus | null;
  @attr<DateTransform>('date') declare updatedAt: Date | null;
  @attr<StringTransform>('string') declare organizationName: string | null;

  @belongsTo<Organization>('organization', { async: true, inverse: 'organizationInvitations' })
  declare organization: AsyncBelongsTo<Organization>;

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isAccepted(): boolean {
    return this.status === 'accepted';
  }
}
