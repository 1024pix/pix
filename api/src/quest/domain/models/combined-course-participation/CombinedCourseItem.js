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
    type,
    redirection,
    participationStatus,
    isCompleted,
    duration,
    image,
    isLocked = true,
    masteryRate = null,
    totalStagesCount = null,
    validatedStagesCount = null,
  }) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.redirection = redirection;
    this.type = type;
    this.participationStatus = participationStatus;
    this.isCompleted = isCompleted;
    this.isLocked = isLocked;
    this.duration = duration;
    this.image = image;
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
}
