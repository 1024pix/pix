import Model, { attr } from '@warp-drive/legacy/model';

export default class CombinedCourseStatistic extends Model {
  @attr('number') participationsCount;
  @attr('number') completedParticipationsCount;
}
