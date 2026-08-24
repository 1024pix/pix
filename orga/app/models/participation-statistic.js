import Model, { attr } from '@warp-drive/legacy/model';

export default class ParticipationStatistic extends Model {
  @attr('number') totalParticipationCount;
  @attr('number') completedParticipationCount;
  @attr('number') sharedParticipationCountLastThirtyDays;
}
