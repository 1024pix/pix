import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type CampaignAssessmentParticipationResult from './campaign-assessment-participation-result';

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  declare [Type]: 'campaign-assessment-participation-competence-result';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare index: string | null;
  @attr<StringTransform>('string') declare areaColor: string | null;
  @attr<NumberTransform>('number') declare competenceMasteryRate: number | null;

  @belongsTo<CampaignAssessmentParticipationResult>('campaign-assessment-participation-result', {
    async: true,
    inverse: 'competenceResults',
  })
  declare campaignAssessmentParticipationResult: AsyncBelongsTo<CampaignAssessmentParticipationResult>;
}
