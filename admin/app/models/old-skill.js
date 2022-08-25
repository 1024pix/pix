import Model, { attr } from '@ember-data/model';

export default class OldSkill extends Model {
  @attr() name;
  @attr() difficulty;
}
