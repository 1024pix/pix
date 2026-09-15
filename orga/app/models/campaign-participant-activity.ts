import type { CampaignParticipationStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class CampaignParticipantActivity extends Model {
  declare [Type]: 'campaign-participant-activity';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare participantExternalId: string | null;
  @attr<StringTransform>('string') declare status: CampaignParticipationStatus | null;
  @attr<NumberTransform>('number') declare lastCampaignParticipationId: number | null;
  @attr<NumberTransform>('number') declare participationCount: number | null;
}
