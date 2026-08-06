import Model, { attr } from '@warp-drive/legacy/model';

export default class QuestResult extends Model {
  // attributes
  // eslint-disable-next-line ember/no-empty-attrs
  @attr obtained;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr reward;
  @attr('number') profileRewardId;
}
