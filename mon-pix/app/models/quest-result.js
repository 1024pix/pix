import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class QuestResult extends Model {
  // attributes
  @attr obtained;
  @attr reward;
}
