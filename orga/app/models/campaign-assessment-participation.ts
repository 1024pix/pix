import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type Badge from './badge';
import type CampaignAssessmentParticipationResult from './campaign-assessment-participation-result';
import type CampaignParticipationLevelsPerTubesAndCompetence from './campaign-participation-levels-per-tubes-and-competence';

export default class CampaignAssessmentParticipation extends Model {
  declare [Type]: 'campaign-assessment-participation';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<NumberTransform>('number') declare organizationLearnerId: number | null;
  @attr<NumberTransform>('number') declare campaignId: number | null;
  @attr<StringTransform>('string') declare participantExternalId: string | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<DateTransform>('date') declare sharedAt: Date | null;
  @attr<BooleanTransform>('boolean') declare isShared: boolean | null;
  @attr<NumberTransform>('number') declare targetedSkillsCount: number | null;
  @attr<NumberTransform>('number') declare validatedSkillsCount: number | null;
  @attr<NumberTransform>('number') declare masteryRate: number | null;
  @attr<NumberTransform>('number') declare reachedStage: number | null;
  @attr<NumberTransform>('number') declare totalStage: number | null;
  @attr<StringTransform>('string') declare prescriberTitle: string | null;
  @attr<StringTransform>('string') declare prescriberDescription: string | null;
  @attr<NumberTransform>('number') declare progression: number | null;

  @belongsTo<CampaignAssessmentParticipationResult>('campaign-assessment-participation-result', {
    async: true,
    inverse: 'campaignAssessmentParticipation',
  })
  declare campaignAssessmentParticipationResult: AsyncBelongsTo<CampaignAssessmentParticipationResult>;
  @belongsTo<CampaignParticipationLevelsPerTubesAndCompetence>(
    'campaign-participation-levels-per-tubes-and-competence',
    {
      async: true,
      inverse: null,
    },
  )
  declare campaignParticipationLevelsPerTubesAndCompetence: AsyncBelongsTo<CampaignParticipationLevelsPerTubesAndCompetence>;

  @hasMany('badge', { async: true, inverse: null }) declare badges: AsyncHasMany<Badge>;
}
