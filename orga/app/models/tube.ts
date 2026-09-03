import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Skill from './skill';

export default class Tube extends Model {
  declare [Type]: 'tube';

  @attr<StringTransform>('string') declare practicalTitle: string | null;
  @attr<StringTransform>('string') declare practicalDescription: string | null;
  @attr<BooleanTransform>('boolean') declare isMobileCompliant: boolean | null;
  @attr<BooleanTransform>('boolean') declare isTabletCompliant: boolean | null;
  @attr<NumberTransform>('number') declare maxLevel: number | null;

  @hasMany<Skill>('skill', { async: false, inverse: null }) declare skills: HasMany<Skill>;
}
