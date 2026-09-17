import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class CombinedCourseBlueprint extends Model {
  declare [Type]: 'combined-course-blueprint';

  @attr<StringTransform>('string') declare name: string | null;
}
