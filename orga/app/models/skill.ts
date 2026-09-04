import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

export default class Skill extends Model {
  declare [Type]: 'skill';

  @attr<NumberTransform>('number') declare difficulty: number | null;
}
