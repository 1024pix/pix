import { COMBINED_COURSE_ITEM_TYPES, type CombinedCourseItemCategory } from '../../../constants.ts';

export type CombinedCourseItemParams = {
  id: number | string;
  title?: string;
  reference: string | number;
  redirection?: string;
  participationStatus?: string;
  duration?: number;
  image?: string;
  isLocked?: boolean;
};

export type TrainingCombinedCourseItemParams = CombinedCourseItemParams & {
  type: CombinedCourseItemCategory;
};

export type CampaignCombinedCourseItemParams = CombinedCourseItemParams & {
  type?: CombinedCourseItemCategory;
  isCompleted?: boolean;
  masteryRate?: number | null;
  totalStagesCount?: number | null;
  validatedStagesCount?: number | null;
};

export type ModuleCombinedCourseItemParams = CombinedCourseItemParams & {
  type?: CombinedCourseItemCategory;
  isCompleted?: boolean;
  shortId: string;
  level: string;
  description: string;
  objectives: string[];
};

class CombinedCourseItem {
  id: number | string;
  title?: string;
  reference: string | number;
  redirection?: string;
  participationStatus?: string;
  isLocked: boolean;
  duration?: number;
  image?: string;

  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    duration,
    image,
    isLocked = true,
  }: CombinedCourseItemParams) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.redirection = redirection;
    this.participationStatus = participationStatus;
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
    duration,
    image,
    isLocked = true,
  }: CombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      isLocked,
      duration,
      image,
    });
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.FORMATION;
  }
}

export class CampaignCombinedCourseItem extends CombinedCourseItem {
  masteryRate: number | null;
  totalStagesCount: number | null;
  validatedStagesCount: number | null;
  isCompleted: boolean;

  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted = false,
    duration,
    image,
    masteryRate = null,
    totalStagesCount = null,
    validatedStagesCount = null,
  }: CampaignCombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      isLocked: true,
      duration,
      image,
    });
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
    this.isCompleted = isCompleted;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.CAMPAIGN;
  }
}

export class ModuleCombinedCourseItem extends CombinedCourseItem {
  shortId: string;
  level: string;
  description: string;
  objectives: string[];
  isCompleted: boolean;

  constructor({
    id,
    title,
    reference,
    redirection,
    participationStatus,
    isCompleted = false,
    isLocked,
    duration,
    image,
    shortId,
    level,
    description,
    objectives,
  }: ModuleCombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      isLocked,
      duration,
      image,
    });
    this.shortId = shortId;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
    this.isCompleted = isCompleted;
  }
  get type() {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
