import Model, { attr } from '@ember-data/model';

export default class Scorecard extends Model {
  @attr('number') earnedPix;
  @attr('number') index;
  @attr('number') level;
  @attr('string') name;
}
