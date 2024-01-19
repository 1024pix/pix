import Model, { attr } from '@ember-data/model';

export default class Passage extends Model {
  @attr('string') moduleId;
}
