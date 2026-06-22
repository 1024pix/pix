import Model, { attr, hasMany } from '@ember-data/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('string') illustration;

  @hasMany('combined-course-blueprint-item', { async: false, inverse: null }) items;
}
