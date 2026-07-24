import Model, { attr, hasMany } from '@ember-data/model';

export default class RewardRequirement extends Model {
  @attr() cappedTubesThreshold;

  @hasMany('area', { async: true, inverse: null }) areas;
}
