import Model, { attr } from '@ember-data/model';

export default class Competence extends Model {
  @attr('string') name;
  @attr('string') areaId;
  @attr('string') index;
}
