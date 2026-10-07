export const COMBINED_COURSE_ITEM_TYPES = {
  MODULE: 'module',
  CAMPAIGN: 'campaign',
  FORMATION: 'formation',
};

export type CombinedCourseItemCategory = (typeof COMBINED_COURSE_ITEM_TYPES)[keyof typeof COMBINED_COURSE_ITEM_TYPES];

export const COURSE_ITEM_TYPES = {
  TARGET_PROFILE: 'targetProfile',
  BLUEPRINT: 'blueprint',
} as const;

export type CourseItemType = (typeof COURSE_ITEM_TYPES)[keyof typeof COURSE_ITEM_TYPES];
