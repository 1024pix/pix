export const COMBINED_COURSE_ITEM_TYPES = {
  MODULE: 'module',
  CAMPAIGN: 'campaign',
  FORMATION: 'formation',
};

export type CombinedCourseItemCategory = (typeof COMBINED_COURSE_ITEM_TYPES)[keyof typeof COMBINED_COURSE_ITEM_TYPES];
