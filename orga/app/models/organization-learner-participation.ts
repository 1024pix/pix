import type { CampaignParticipationStatus, CampaignType } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { DateTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type OrganizationLearnerActivity from './organization-learner-activity';

export default class OrganizationLearnerParticipation extends Model {
  declare [Type]: 'organization-learner-participation';

  @attr<StringTransform>('string') declare campaignType: CampaignType | null;
  @attr<StringTransform>('string') declare campaignName: string | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<DateTransform>('date') declare sharedAt: Date | null;
  @attr<StringTransform>('string') declare status: CampaignParticipationStatus | null;
  @attr<NumberTransform>('number') declare campaignId: number | null;
  @attr<NumberTransform>('number') declare participationCount: number | null;
  @attr<NumberTransform>('number') declare lastCampaignParticipationId: number | null;

  @belongsTo<OrganizationLearnerActivity>('organization-learner-activity', {
    async: true,
    inverse: 'organizationLearnerParticipations',
  })
  declare organizationLearnerActivity: AsyncBelongsTo<OrganizationLearnerActivity>;
}
