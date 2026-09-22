import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type HasMany, hasMany } from '@warp-drive/legacy/model';

import type Banner from './banner';

export default class InformationBanner extends Model {
  declare [Type]: 'information-banner';

  @hasMany<Banner>('banner', { async: false, inverse: null }) declare banners: HasMany<Banner>;
}
