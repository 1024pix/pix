import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class RewardRequirement extends Model {
  @attr() cappedTubesThreshold;

  @hasMany('area', { async: true, inverse: null }) areas;
}
