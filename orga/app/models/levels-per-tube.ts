import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, belongsTo } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type LevelsPerCompetence from './levels-per-competence';

export default class LevelsPerTube extends Model {
  declare [Type]: 'levels-per-tube';

  @attr<StringTransform>('string') declare competenceId: string | null;
  @attr<NumberTransform>('number') declare maxLevel: number | null;
  @attr<NumberTransform>('number') declare meanLevel: number | null;
  @attr<StringTransform>('string') declare description: string | null;
  @attr<StringTransform>('string') declare title: string | null;

  @belongsTo<LevelsPerCompetence>('levels-per-competence', { async: false, inverse: null })
  declare levelsPerCompetence: LevelsPerCompetence | null;
}
