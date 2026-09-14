import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type { CampaignParticipationStatus } from '../utils/campaign-participation-statuses';

export default class AvailableCampaignParticipation extends Model {
  declare [Type]: 'available-campaign-participation';

  @attr<DateTransform>('date') declare sharedAt: Date | null;
  @attr<StringTransform>('string') declare status: CampaignParticipationStatus | null;
}
