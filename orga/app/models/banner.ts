import type { InformationBannerSeverity } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';

export default class Banner extends Model {
  declare [Type]: 'banner';

  @attr() declare severity: InformationBannerSeverity | null;
  @attr() declare message: string | null;
}
