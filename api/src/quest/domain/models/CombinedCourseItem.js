export const COMBINED_COURSE_ITEM_TYPES = {
  CAMPAIGN: 'CAMPAIGN',
  MODULE: 'MODULE',
  FORMATION: 'FORMATION',
};

export class CombinedCourseItem {
  constructor({ id, title, reference, type, isCompleted, isLocked = true }) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.type = type;
    this.isCompleted = isCompleted;
    this.isLocked = isLocked;
  }
}

export class CampaignItem extends CombinedCourseItem {
  constructor({ participationStatus, masteryRate = null, totalStagesCount = null, validatedStagesCount = null, ...rest }) {
    super({ ...rest, type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN });
    this.participationStatus = participationStatus;
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
}

export class ModuleItem extends CombinedCourseItem {
  constructor({ participationStatus, redirection, duration, image, shortId, ...rest }) {
    super({ ...rest, type: COMBINED_COURSE_ITEM_TYPES.MODULE });
    this.participationStatus = participationStatus;
    this.redirection = redirection;
    this.duration = duration;
    this.image = image;
    this.shortId = shortId;
  }
}

export class FormationItem extends CombinedCourseItem {
  constructor(args) {
    super({ ...args, type: COMBINED_COURSE_ITEM_TYPES.FORMATION });
  }
}
