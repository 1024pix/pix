import Model, { attr } from '@ember-data/model';

export default class Competence extends Model {
  // attributes
  @attr('string') name;
}
