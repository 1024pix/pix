import Model, { attr } from '@ember-data/model';

export default class TrainingSummary extends Model {
  @attr() title;
  @attr('boolean') isRecommendable;
}
