import Model, { attr } from '@ember-data/model';

export default class QuestResult extends Model {
  // attributes
  @attr obtained;
  @attr reward;
}
