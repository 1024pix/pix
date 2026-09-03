import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Competence from './competence';

export default class Area extends Model {
  declare [Type]: 'area';

  @attr<StringTransform>('string') declare code: string | null;
  @attr<StringTransform>('string') declare title: string | null;
  @attr<StringTransform>('string') declare color: string | null;

  @hasMany<Competence>('competence', { async: false, inverse: null }) declare competences: HasMany<Competence>;

  get sortedCompetences(): Competence[] {
    return this.competences.slice().sort((a, b) => {
      return Number(a.index) - Number(b.index);
    });
  }
}
