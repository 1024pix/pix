import type { CombinedCourseItemType, CombinedCourseStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class CombinedCourseItem extends Model {
  declare [Type]: 'combined-course-item';

  @attr<StringTransform>('string') declare title: string | null;
  @attr<StringTransform>('string') declare type: CombinedCourseItemType | null;
  @attr<NumberTransform>('number') declare masteryRate: number | null;
  @attr<StringTransform>('string') declare participationStatus: CombinedCourseStatus | null;
  @attr<BooleanTransform>('boolean') declare isCompleted: boolean | null;
  @attr<BooleanTransform>('boolean') declare isLocked: boolean | null;
  @attr<NumberTransform>('number') declare totalStagesCount: number | null;
  @attr<NumberTransform>('number') declare validatedStagesCount: number | null;
}
