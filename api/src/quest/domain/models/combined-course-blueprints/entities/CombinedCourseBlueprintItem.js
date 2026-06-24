import { COMBINED_COURSE_ITEM_TYPES } from '../../../constants.js';

class CombinedCourseBlueprintItem {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
}

export class CampaignCombinedCourseBlueprintItem extends CombinedCourseBlueprintItem {
  constructor({ id, name }) {
    super({ id, name });
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.EVALUATION;
  }
}

export class ModuleCombinedCourseBlueprintItem extends CombinedCourseBlueprintItem {
  constructor({ id, name, duration, image, isRecommendable }) {
    super({ id, name });
    this.duration = duration;
    this.image = image;
    this.isRecommendable = isRecommendable;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
