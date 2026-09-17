import type { Type } from '@warp-drive/core/types/symbols';
import Model, { belongsTo, type HasMany, hasMany } from '@warp-drive/legacy/model';

import type CombinedCourseItem from './combined-course-item';
import type CombinedCourseParticipation from './combined-course-participation';

export default class CombinedCourseParticipationDetail extends Model {
  declare [Type]: 'combined-course-participation-detail';

  @belongsTo<CombinedCourseParticipation>('combined-course-participation', { async: false, inverse: null })
  declare participation: CombinedCourseParticipation | null;

  @hasMany<CombinedCourseItem>('combined-course-item', { async: false, inverse: null })
  declare items: HasMany<CombinedCourseItem>;
}
