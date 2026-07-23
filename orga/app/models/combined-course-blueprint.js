import Model, { attr } from '@warp-drive/legacy/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
}
