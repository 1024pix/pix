import Model, { attr } from '@ember-data/model';

export default class Stage extends Model {
  @attr('string') prescriberTitle;
  @attr('string') prescriberDescription;
  @attr('number') threshold;
}
