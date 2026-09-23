import type { OrganizationPlacesLotStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { DateTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class PlacesLot extends Model {
  declare [Type]: 'organization-places-lot';

  @attr<NumberTransform>('number') declare count: number | null;
  @attr<DateTransform>('date') declare activationDate: Date | null;
  @attr<DateTransform>('date') declare expirationDate: Date | null;
  @attr<StringTransform>('string') declare status: OrganizationPlacesLotStatus | null;
}

export const STATUSES = {
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  ACTIVE: 'ACTIVE',
} as const satisfies Record<OrganizationPlacesLotStatus, OrganizationPlacesLotStatus>;
