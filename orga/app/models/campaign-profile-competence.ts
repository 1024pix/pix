import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class CampaignProfileCompetence extends Model {
  declare [Type]: 'campaign-profile-competence';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare index: string | null;
  @attr<NumberTransform>('number') declare pixScore: number | null;
  @attr<NumberTransform>('number') declare estimatedLevel: number | null;
  @attr<StringTransform>('string') declare areaColor: string | null;
}
