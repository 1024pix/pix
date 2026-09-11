import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

import type OrganizationLearnerActivity from './organization-learner-activity';

export default class OrganizationLearnerStatistic extends Model {
  declare [Type]: 'organization-learner-statistic';

  @attr<NumberTransform>('number') declare shared: number | null;
  @attr<NumberTransform>('number') declare started: number | null;
  @attr<NumberTransform>('number') declare total: number | null;

  @belongsTo<OrganizationLearnerActivity>('organization-learner-activity', {
    async: true,
    inverse: 'organizationLearnerStatistics',
  })
  declare organizationLearnerActivity: AsyncBelongsTo<OrganizationLearnerActivity>;
}
