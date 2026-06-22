import Model, { attr } from '@ember-data/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
  @attr('string') type;
  @attr('number') duration;
  @attr('string') image;
  @attr('boolean') isRecommendable;
}
