import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type { CampaignParticipationStatus } from '../utils/campaign-participation-statuses';
import type { CampaignType } from '../utils/campaign-types';

export default class OrganizationParticipant extends Model {
  declare [Type]: 'organization-participant';

  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<NumberTransform>('number') declare participationCount: number | null;
  @attr<DateTransform>('date') declare lastParticipationDate: Date | null;
  @attr<StringTransform>('string') declare campaignName: string | null;
  @attr<StringTransform>('string') declare campaignType: CampaignType | null;
  @attr<StringTransform>('string') declare participationStatus: CampaignParticipationStatus | null;
  @attr<BooleanTransform>('boolean', { allowNull: true }) declare isCertifiable: boolean | null;
  @attr<DateTransform>('date') declare certifiableAt: Date | null;
  @attr() declare extraColumns: Record<string, string> | null;
}
