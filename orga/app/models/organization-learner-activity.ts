import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, hasMany } from '@warp-drive/legacy/model';

import type OrganizationLearnerParticipation from './organization-learner-participation';
import type OrganizationLearnerStatistic from './organization-learner-statistic';

export default class OrganizationLearnerActivity extends Model {
  declare [Type]: 'organization-learner-activity';

  @hasMany<OrganizationLearnerParticipation>('organization-learner-participation', {
    async: true,
    inverse: 'organizationLearnerActivity',
  })
  declare organizationLearnerParticipations: AsyncHasMany<OrganizationLearnerParticipation>;
  @hasMany<OrganizationLearnerStatistic>('organization-learner-statistic', {
    async: true,
    inverse: 'organizationLearnerActivity',
  })
  declare organizationLearnerStatistics: AsyncHasMany<OrganizationLearnerStatistic>;
}
