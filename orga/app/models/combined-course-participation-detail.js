import Model, { belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class CombinedCourseParticipationDetail extends Model {
  @belongsTo('combined-course-participation', { async: false, inverse: null }) participation;
  @hasMany('combined-course-item', { async: false, inverse: null }) items;
}
