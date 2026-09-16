import type { CampaignParticipationStatus, CampaignType } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type DateOnlyTransform from '../transforms/date-only';
import type Organization from './organization';

export default class SupOrganizationParticipant extends Model {
  declare [Type]: 'sup-organization-participant';

  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<DateOnlyTransform>('date-only') declare birthdate: string | null;
  @attr<StringTransform>('string') declare studentNumber: string | null;
  @attr<StringTransform>('string') declare group: string | null;
  @attr<NumberTransform>('number') declare participationCount: number | null;
  @attr<DateTransform>('date') declare lastParticipationDate: Date | null;
  @attr<StringTransform>('string') declare campaignName: string | null;
  @attr<StringTransform>('string') declare campaignType: CampaignType | null;
  @attr<StringTransform>('string') declare participationStatus: CampaignParticipationStatus | null;
  @attr<BooleanTransform>('boolean', { allowNull: true }) declare isCertifiable: boolean | null;
  @attr<DateTransform>('date') declare certifiableAt: Date | null;

  @belongsTo('organization', { async: true, inverse: null }) declare organization: AsyncBelongsTo<Organization>;
}
