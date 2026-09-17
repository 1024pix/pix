import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type CombinedCourseParticipation from './combined-course-participation';
import type CombinedCourseStatistic from './combined-course-statistic';

export default class CombinedCourse extends Model {
  declare [Type]: 'combined-course';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare code: string | null;
  @attr<NumberTransform>('number') declare participationsCount: number | null;
  @attr<NumberTransform>('number') declare completedParticipationsCount: number | null;
  @attr<BooleanTransform>('boolean') declare hasCampaigns: boolean | null;
  @attr<BooleanTransform>('boolean') declare hasModules: boolean | null;
  @attr<BooleanTransform>('boolean') declare hasReward: boolean | null;
  @attr({ defaultValue: () => [] }) declare campaignIds: number[];

  @hasMany<CombinedCourseParticipation>('combined-course-participation', { async: true, inverse: null })
  declare combinedCourseParticipations: AsyncHasMany<CombinedCourseParticipation>;

  @belongsTo<CombinedCourseStatistic>('combined-course-statistic', { async: true, inverse: null })
  declare combinedCourseStatistics: AsyncBelongsTo<CombinedCourseStatistic>;
}
