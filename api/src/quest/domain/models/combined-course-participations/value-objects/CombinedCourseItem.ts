import type { CombinedCourseItemCategory } from '../../../constant-types.d.ts';
import { COMBINED_COURSE_ITEM_TYPES } from '../../../constants.js';

type CombinedCourseItemParams = {
  id: number | string;
  title?: string;
  reference: string | number;
  redirection?: string;
  participationStatus?: string;
  duration?: number;
  image?: string;
  isLocked?: boolean;
};

type TrainingCombinedCourseItemParams = CombinedCourseItemParams;

type CampaignCombinedCourseItemParams = CombinedCourseItemParams & {
  isCompleted?: boolean;
  masteryRate?: number | null;
  totalStagesCount?: number | null;
  validatedStagesCount?: number | null;
};

type ModuleCombinedCourseItemParams = CombinedCourseItemParams & {
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
  }: TrainingCombinedCourseItemParams) {
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
  get type(): CombinedCourseItemCategory {
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
    isLocked = true,
  }: CampaignCombinedCourseItemParams) {
    super({
      id,
      title,
      reference,
      redirection,
      participationStatus,
      duration,
      image,
      isLocked,
    });
    this.masteryRate = masteryRate;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
    this.isCompleted = isCompleted;
  }
  get type(): CombinedCourseItemCategory {
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
    isLocked = true,
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
  get type(): CombinedCourseItemCategory {
    return COMBINED_COURSE_ITEM_TYPES.MODULE;
  }
}
