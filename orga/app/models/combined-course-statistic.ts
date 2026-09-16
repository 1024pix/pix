import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

export default class CombinedCourseStatistic extends Model {
  declare [Type]: 'combined-course-statistic';

  @attr<NumberTransform>('number') declare participationsCount: number | null;
  @attr<NumberTransform>('number') declare completedParticipationsCount: number | null;
}
