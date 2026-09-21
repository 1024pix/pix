import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class OrganizationInvitationResponse extends Model {
  declare [Type]: 'organization-invitation-response';

  @attr<StringTransform>('string') declare code: string | null;
  @attr<NumberTransform>('number') declare userId: number | null;
}
