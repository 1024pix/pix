import type { OrganizationType } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type Campaign from './campaign';
import type CombinedCourse from './combined-course';
import type CombinedCourseBlueprint from './combined-course-blueprint';
import type Division from './division';
import type Group from './group';
import type OrganizationInvitation from './organization-invitation';
import type OrganizationLearnerFilter from './organization-learner-filter';
import type ParticipationStatistic from './participation-statistic';
import type TargetProfile from './target-profile';

export default class Organization extends Model {
  declare [Type]: 'organization';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare type: OrganizationType | null;
  @attr<StringTransform>('string') declare externalId: string | null;
  @attr<NumberTransform>('number') declare credit: number | null;
  @attr<BooleanTransform>('boolean') declare isManagingStudents: boolean | null;
  @attr<BooleanTransform>('boolean') declare isAgriculture: boolean | null;
  @attr<StringTransform>('string') declare documentationUrl: string | null;
  @attr<StringTransform>('string') declare identityProviderForCampaigns: string | null;
  @attr<StringTransform>('string') declare schoolCode: string | null;
  @attr<DateTransform>('date') declare sessionExpirationDate: Date | null;

  @hasMany<CombinedCourse>('combined-course', { async: true, inverse: null })
  declare combinedCourses: AsyncHasMany<CombinedCourse>;

  @hasMany<Campaign>('campaign', { async: true, inverse: 'organization' }) declare campaigns: AsyncHasMany<Campaign>;

  @hasMany<TargetProfile>('target-profile', { async: true, inverse: null })
  declare targetProfiles: AsyncHasMany<TargetProfile>;

  @hasMany<CombinedCourseBlueprint>('combined-course-blueprint', { async: true, inverse: null })
  declare combinedCourseBlueprints: AsyncHasMany<CombinedCourseBlueprint>;

  @hasMany<OrganizationInvitation>('organization-invitation', { async: true, inverse: 'organization' })
  declare organizationInvitations: AsyncHasMany<OrganizationInvitation>;

  @hasMany<Group>('group', { async: true, inverse: null }) declare groups: AsyncHasMany<Group>;

  @hasMany<OrganizationLearnerFilter>('organization-learner-filter', { async: true, inverse: null })
  declare learnerFiltersOptions: AsyncHasMany<OrganizationLearnerFilter>;

  @hasMany<Division>('division', { async: true, inverse: null }) declare divisions: AsyncHasMany<Division>;

  @belongsTo('participation-statistic', { async: true, inverse: null })
  declare participationStatistics: AsyncBelongsTo<ParticipationStatistic>;

  get hasGarIdentityProvider(): boolean {
    return this.isScoAndManagingStudents && this.identityProviderForCampaigns === 'GAR';
  }

  get isPro(): boolean {
    return this.type === 'PRO';
  }

  get isSco(): boolean {
    return this.type === 'SCO';
  }

  get isScoAndManagingStudents(): boolean {
    return this.isSco && Boolean(this.isManagingStudents);
  }

  get isSco1d(): boolean {
    return this.type === 'SCO-1D';
  }

  get isSup(): boolean {
    return this.type === 'SUP';
  }
}
