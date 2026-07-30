import Model, { attr } from '@warp-drive/legacy/model';

export default class TrainingSummary extends Model {
  @attr() title;
  @attr() internalTitle;
  @attr('number') targetProfilesCount;
  @attr('number') prerequisiteThreshold;
  @attr('number') goalThreshold;
  @attr('boolean') isDisabled;
}
