import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class OrganizationLearnerFilter extends Model {
  declare [Type]: 'organization-learner-filter';

  @attr<StringTransform>('string') declare attributeName: string | null;
  @attr() declare values: string[] | null;
}
