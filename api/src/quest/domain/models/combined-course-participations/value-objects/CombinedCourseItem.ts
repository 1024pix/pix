import { COMBINED_COURSE_ITEM_TYPES, type CombinedCourseItemCategory } from '../../../constants.ts';

type CombinedCourseItemParams = {
  id: number | string;
  title?: string;
  reference: string | number;
  redirection?: string;
  participationStatus?: string;
  isCompleted?: boolean;
  duration?: number;
  image?: string;
  isLocked?: boolean;
  type: CombinedCourseItemCategory;
};

export type CampaignCombinedCourseItemParams = CombinedCourseItem & {
  masteryRate?: number | null;
  totalStagesCount?: number | null;
  validatedStagesCount?: number | null;
};

export type ModuleCombinedCourseItemParams = CombinedCourseItem & {
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
  isCompleted?: boolean;
  isLocked: boolean;
  duration?: number;
  image?: string;
  type: CombinedCourseItemCategory;

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
    type,
  }: CombinedCourseItemParams) {
    this.id = id;
    this.title = title;
    this.reference = reference;
    this.redirection = redirection;
    this.participationStatus = participationStatus;
    this.isCompleted = isCompleted;
    this.isLocked = isLocked;
    this.duration = duration;
    this.image = image;
    this.type = type;
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
  }: CombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      isCompleted,
      isLocked,
      duration,
      image,
      type: COMBINED_COURSE_ITEM_TYPES.FORMATION,
    });
  }
}

export class CampaignCombinedCourseItem extends CombinedCourseItem {
  masteryRate: number | null;
  totalStagesCount: number | null;
  validatedStagesCount: number | null;

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
  }: CampaignCombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      isCompleted,
      isLocked,
      duration,
      image,
      type: COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
    });
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
}

export class ModuleCombinedCourseItem extends CombinedCourseItem {
  shortId: string;
  level: string;
  description: string;
  objectives: string[];

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
      isCompleted,
      isLocked,
      duration,
      image,
      type: COMBINED_COURSE_ITEM_TYPES.MODULE,
    });
    this.shortId = shortId;
    this.level = level;
    this.description = description;
    this.objectives = objectives;
  }
}
