import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class VerifiedCode extends Model {
  @attr('string') type;

  @belongsTo('campaign', { async: true, inverse: null }) campaign;
  @belongsTo('combined-course', { async: true, inverse: null }) combinedCourse;
}
