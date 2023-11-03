import Model, { attr } from '@ember-data/model';

export default class Mission extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') competenceId;
  @attr('string') tubesIds;
}
