import Model, { attr } from '@ember-data/model';

export default class ScoringAndCapacitySimulatorReport extends Model {
  @attr() capacity;
  @attr() score;
  @attr() competences;
}
