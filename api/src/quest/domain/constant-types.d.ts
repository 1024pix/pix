import type { COMBINED_COURSE_ITEM_TYPES, COURSE_ITEM_TYPES } from './constants.js';

export type CombinedCourseItemCategory = (typeof COMBINED_COURSE_ITEM_TYPES)[keyof typeof COMBINED_COURSE_ITEM_TYPES];

export type CourseItemType = (typeof COURSE_ITEM_TYPES)[keyof typeof COURSE_ITEM_TYPES];
