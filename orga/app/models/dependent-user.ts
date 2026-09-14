import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class DependentUser extends Model {
  declare [Type]: 'dependent-user';

  @attr<NumberTransform>('number') declare organizationId: number | null;
  @attr<NumberTransform>('number') declare organizationLearnerId: number | null;
  @attr<StringTransform>('string') declare generatedPassword: string | null;
  @attr<StringTransform>('string') declare username: string | null;
}
