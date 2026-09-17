import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

import type CombinedCourseBlueprintItem from './combined-course-blueprint-item';
import type { CombinedCourseBlueprintItemType } from './combined-course-blueprint-item';

export interface CombinedCourseBlueprintStep {
  type: CombinedCourseBlueprintItemType | null;
  items: CombinedCourseBlueprintItem[];
}

export default class CombinedCourseBlueprintOverview extends Model {
  declare [Type]: 'combined-course-blueprint-overview';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare description: string | null;
  @attr<StringTransform>('string') declare prescriberDescription: string | null;
  @attr<StringTransform>('string') declare illustration: string | null;

  @hasMany<CombinedCourseBlueprintItem>('combined-course-blueprint-item', { async: false, inverse: null })
  declare items: HasMany<CombinedCourseBlueprintItem>;

  get steps(): CombinedCourseBlueprintStep[] {
    return this.items.reduce<CombinedCourseBlueprintStep[]>((steps, item) => {
      const currentStep = steps.at(-1);
      if (currentStep && currentStep.type === item.type) {
        currentStep.items.push(item);
      } else {
        steps.push({ type: item.type, items: [item] });
      }
      return steps;
    }, []);
  }
}
