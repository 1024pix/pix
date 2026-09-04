import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

import type CampaignAssessmentParticipation from './campaign-assessment-participation';
import type CampaignAssessmentParticipationCompetenceResult from './campaign-assessment-participation-competence-result';

export default class CampaignAssessmentParticipationResult extends Model {
  declare [Type]: 'campaign-assessment-participation-result';

  @attr<NumberTransform>('number') declare campaignId: number | null;

  @belongsTo<CampaignAssessmentParticipation>('campaign-assessment-participation', {
    async: true,
    inverse: 'campaignAssessmentParticipationResult',
  })
  declare campaignAssessmentParticipation: AsyncBelongsTo<CampaignAssessmentParticipation>;
  @hasMany<CampaignAssessmentParticipationCompetenceResult>('campaign-assessment-participation-competence-result', {
    async: true,
    inverse: 'campaignAssessmentParticipationResult',
  })
  declare competenceResults: AsyncHasMany<CampaignAssessmentParticipationCompetenceResult>;
}
