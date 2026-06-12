export const COMBINED_COURSE_ITEM_TYPES = {
  CAMPAIGN: 'CAMPAIGN',
  MODULE: 'MODULE',
  FORMATION: 'FORMATION',
};

export class CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    duration,
    image,
    isLocked = true,
  }) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.redirection = redirection;
    this.participationStatus = participationStatus;
    this.isCompleted = isCompleted;
    this.isLocked = isLocked;
    this.duration = duration;
    this.image = image;
  }
}

export class TrainingCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    duration,
    image,
    isLocked = true,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.FORMATION;
  }
}

export class CampaignCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    isLocked,
    duration,
    image,
    masteryRate = null,
    totalStagesCount = null,
    validatedStagesCount = null,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.CAMPAIGN;
  }
}

export class ModuleCombinedCourseItem extends CombinedCourseItem {
  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted,
    isLocked,
    duration,
    image,
    shortId,
  }) {
    super({ id, title, reference, redirection, participationStatus, isCompleted, isLocked, duration, image });
    this.shortId = shortId;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
