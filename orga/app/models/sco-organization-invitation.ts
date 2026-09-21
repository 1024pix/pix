import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class ScoOrganizationInvitation extends Model {
  declare [Type]: 'sco-organization-invitation';

  @attr<StringTransform>('string') declare uai: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
}
