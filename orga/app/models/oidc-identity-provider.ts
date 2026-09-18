import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';

export default class OidcIdentityProvider extends Model {
  declare [Type]: 'oidc-identity-provider';

  @attr() declare code: string | null;
  @attr() declare organizationName: string | null;
  @attr() declare slug: string | null;
  @attr() declare shouldCloseSession: boolean | null;
  @attr() declare source: string | null;
  @attr() declare isVisible: boolean | null;
}
