import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform } from '@warp-drive/legacy/serializer/transform';

export default class ParticipationStatistic extends Model {
  declare [Type]: 'participation-statistic';

  @attr<NumberTransform>('number') declare totalParticipationCount: number | null;
  @attr<NumberTransform>('number') declare completedParticipationCount: number | null;
  @attr<NumberTransform>('number') declare sharedParticipationCountLastThirtyDays: number | null;
}
