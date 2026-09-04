import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, attr, hasMany } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Tube from './tube';

export default class Thematic extends Model {
  declare [Type]: 'thematic';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<NumberTransform>('number') declare index: number | null;

  @hasMany<Tube>('tube', { async: true, inverse: null }) declare tubes: AsyncHasMany<Tube>;

  get sortedTubes(): Tube[] | undefined {
    return (this as Thematic)
      .hasMany('tubes')
      .value()
      ?.slice()
      .sort((a, b) => {
        return (a.practicalTitle ?? '').localeCompare(b.practicalTitle ?? '');
      });
  }
}
