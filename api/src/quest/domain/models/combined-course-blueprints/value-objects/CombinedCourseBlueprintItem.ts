import type { CombinedCourseItemCategory } from '../../../constant-types.d.ts';
import { COMBINED_COURSE_ITEM_TYPES } from '../../../constants.js';

type CombinedCourseBlueprintItemArgs = {
  id: number | string;
  name: string;
};

export type CampaignCombinedCourseBlueprintItemArgs = {
  id: number | string;
  name: string;
};

export type ModuleCombinedCourseBlueprintItemArgs = {
  id: number | string;
  name: string;
  duration: number;
  image: string;
  isRecommendable: boolean;
};

class CombinedCourseBlueprintItem {
  id: number | string;
  name: string;

  constructor({ id, name }: CombinedCourseBlueprintItemArgs) {
    this.id = id;
    this.name = name;
  }
}

export class CampaignCombinedCourseBlueprintItem extends CombinedCourseBlueprintItem {
  constructor({ id, name }: CampaignCombinedCourseBlueprintItemArgs) {
    super({ id, name });
  }
  get type(): CombinedCourseItemCategory {
    return COMBINED_COURSE_ITEM_TYPES.CAMPAIGN;
  }
}

export class ModuleCombinedCourseBlueprintItem extends CombinedCourseBlueprintItem {
  duration: number;
  image: string;
  isRecommendable: boolean;

  constructor({ id, name, duration, image, isRecommendable }: ModuleCombinedCourseBlueprintItemArgs) {
    super({ id, name });
    this.duration = duration;
    this.image = image;
    this.isRecommendable = isRecommendable;
  }
  get type(): CombinedCourseItemCategory {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
