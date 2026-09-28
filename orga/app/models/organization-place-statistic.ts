import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform } from '@warp-drive/legacy/serializer/transform';

export default class PlaceStatistics extends Model {
  declare [Type]: 'organization-place-statistic';

  @attr<NumberTransform>('number') declare available: number | null;
  @attr<NumberTransform>('number') declare total: number | null;
  @attr<NumberTransform>('number') declare occupied: number | null;
  @attr<NumberTransform>('number') declare anonymousSeat: number | null;
  @attr<BooleanTransform>('boolean') declare hasReachedMaximumPlacesLimit: boolean | null;

  get hasAnonymousSeat(): boolean {
    return (this.anonymousSeat ?? 0) > 0;
  }
}
