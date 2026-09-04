import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type CampaignCollectiveResult from './campaign-collective-result';

export default class CampaignCompetenceCollectiveResult extends Model {
  declare [Type]: 'campaign-competence-collective-result';

  @attr<StringTransform>('string') declare areaCode: string | null;
  @attr<StringTransform>('string') declare areaColor: string | null;
  @attr<StringTransform>('string') declare competenceName: string | null;
  @attr<StringTransform>('string') declare competenceId: string | null;
  @attr<NumberTransform>('number') declare averageValidatedSkills: number | null;
  @attr<NumberTransform>('number') declare targetedSkillsCount: number | null;

  @belongsTo<CampaignCollectiveResult>('campaign-collective-result', {
    async: true,
    inverse: 'campaignCompetenceCollectiveResults',
  })
  declare campaignCollectiveResult: AsyncBelongsTo<CampaignCollectiveResult>;

  get validatedSkillsPercentage(): number {
    return Math.round(((this.averageValidatedSkills ?? 0) * 100) / (this.targetedSkillsCount ?? 0));
  }
}
