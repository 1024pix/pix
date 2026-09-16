import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export type CombinedCourseBlueprintItemType = 'evaluation' | 'module' | 'campaign';

export const CombinedCourseBlueprintItemTypes = {
  EVALUATION: 'evaluation',
  MODULE: 'module',
  CAMPAIGN: 'campaign',
} as const satisfies Record<Uppercase<CombinedCourseBlueprintItemType>, CombinedCourseBlueprintItemType>;

const CAMPAIGN_ICON_URL = 'https://assets.pix.org/combined-courses/campaign-icon.svg';

export default class CombinedCourseBlueprintItem extends Model {
  declare [Type]: 'combined-course-blueprint-item';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare type: CombinedCourseBlueprintItemType | null;
  @attr<NumberTransform>('number') declare duration: number | null;
  @attr<StringTransform>('string') declare image: string | null;
  @attr<BooleanTransform>('boolean') declare isRecommendable: boolean | null;

  get iconUrl(): string | null {
    return this.isEvaluation ? CAMPAIGN_ICON_URL : this.image;
  }

  get isEvaluation(): boolean {
    return this.type === CombinedCourseBlueprintItemTypes.EVALUATION;
  }

  get isModule(): boolean {
    return this.type === CombinedCourseBlueprintItemTypes.MODULE;
  }
}
