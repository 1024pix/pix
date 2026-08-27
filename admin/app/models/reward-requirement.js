import Model, { attr } from '@warp-drive/legacy/model';

export default class RewardRequirement extends Model {
  @attr() cappedTubesThreshold;
  @attr() name;
  @attr() areas;
}
