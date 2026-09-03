import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, attr, hasMany } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Thematic from './thematic';

export default class Competence extends Model {
  declare [Type]: 'competence';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare index: string | null;

  @hasMany<Thematic>('thematic', { async: true, inverse: null }) declare thematics: AsyncHasMany<Thematic>;

  get sortedThematics(): Thematic[] | undefined {
    return (this as Competence)
      .hasMany('thematics')
      .value()
      ?.slice()
      .sort((a, b) => {
        return (a.index ?? 0) - (b.index ?? 0);
      });
  }
}
