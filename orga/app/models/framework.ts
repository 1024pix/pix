import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, attr, hasMany } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Area from './area';

export default class Framework extends Model {
  declare [Type]: 'framework';

  @attr<StringTransform>('string') declare name: string | null;

  @hasMany<Area>('area', { async: true, inverse: null }) declare areas: AsyncHasMany<Area>;

  get sortedAreas(): Area[] | undefined {
    return (this as Framework)
      .hasMany('areas')
      .value()
      ?.slice()
      .sort((a, b) => {
        return (a.code ?? '').localeCompare(b.code ?? '');
      });
  }
}
