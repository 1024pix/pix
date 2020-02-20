import Model, { attr } from '@ember-data/model';

export default class Levelup extends Model {

  // attributes
  @attr('string') competenceName;
  @attr('number') level;
}
