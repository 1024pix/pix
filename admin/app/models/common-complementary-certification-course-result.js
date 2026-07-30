import Model, { attr } from '@warp-drive/legacy/model';

export default class CommonComplementaryCertificationCourseResult extends Model {
  @attr('string') label;
  @attr('string') status;
}
