import Model, { attr } from '@ember-data/model';

export default class CommonComplementaryCertificationCourseResult extends Model {
  @attr('string') label;
  @attr('string') status;
}
