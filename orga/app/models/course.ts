import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Area from './area';

export default class Course extends Model {
  declare [Type]: 'course';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare type: string | null;
  @attr<NumberTransform>('number') declare nbTubes: number | null;
  @attr<NumberTransform>('number') declare nbModules: number | null;
  @attr<StringTransform>('string') declare category: string | null;
  @attr<BooleanTransform>('boolean') declare isSimplifiedAccess: boolean | null;

  @hasMany('area', { async: false, inverse: null }) declare areas: HasMany<Area>;
}
