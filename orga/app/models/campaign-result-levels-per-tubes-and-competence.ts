import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

import type LevelsPerCompetence from './levels-per-competence';

export default class CampaignResultLevelsPerTubesAndCompetence extends Model {
  declare [Type]: 'campaign-result-levels-per-tubes-and-competence';

  @attr<NumberTransform>('number') declare maxReachableLevel: number | null;
  @attr<NumberTransform>('number') declare meanReachedLevel: number | null;
  @attr declare levelsPerTube: unknown;

  @hasMany<LevelsPerCompetence>('levels-per-competence', { async: false, inverse: null })
  declare levelsPerCompetence: HasMany<LevelsPerCompetence>;
}
