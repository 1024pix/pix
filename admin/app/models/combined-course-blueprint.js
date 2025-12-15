import Model, { attr } from '@ember-data/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
  @attr('string') illustration;
  @attr('string') description;
  @attr('string') internalName;
  @attr('date') createdAt;
  @attr({ defaultValue: () => [] }) content;
}
