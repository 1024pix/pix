import Model, { attr } from '@warp-drive/legacy/model';

export default class CombinedCourseItem extends Model {
  @attr('string') title;
  @attr('string') type;
  @attr('number') masteryRate;
  @attr('string') participationStatus;
  @attr('boolean') isCompleted;
  @attr('boolean') isLocked;
  @attr('number') totalStagesCount;
  @attr('number') validatedStagesCount;
}
