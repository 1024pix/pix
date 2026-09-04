import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, belongsTo, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type CampaignParticipationLevelsPerTubesAndCompetence from './campaign-participation-levels-per-tubes-and-competence';
import type LevelsPerTube from './levels-per-tube';

export default class LevelsPerCompetence extends Model {
  declare [Type]: 'levels-per-competence';

  @attr<StringTransform>('string') declare index: string | null;
  @attr<NumberTransform>('number') declare maxLevel: number | null;
  @attr<NumberTransform>('number') declare meanLevel: number | null;
  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare description: string | null;

  @belongsTo('campaign-analysis-by-tubes-and-competence', { async: false, inverse: null })
  declare campaignAnalysisByTubesAndCompetences: unknown;
  @belongsTo<CampaignParticipationLevelsPerTubesAndCompetence>(
    'campaign-participation-levels-per-tubes-and-competence',
    {
      async: false,
      inverse: null,
    },
  )
  declare campaignParticipationLevelsPerTubesAndCompetence: CampaignParticipationLevelsPerTubesAndCompetence | null;
  @hasMany<LevelsPerTube>('levels-per-tube', { async: false, inverse: null })
  declare levelsPerTube: HasMany<LevelsPerTube>;
}
