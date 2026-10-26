import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class LtiCampaign extends Model {
  declare [Type]: 'lti-campaign';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare code: string | null;
  @attr<StringTransform>('string') declare type: string | null;
  @attr<StringTransform>('string') declare organizationName: string | null;
  @attr<StringTransform>('string') declare description: string | null;
}
