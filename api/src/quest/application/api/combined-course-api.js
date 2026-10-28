import { usecases } from '../../domain/usecases/index.js';
import { CombinedCourse } from './CombinedCourse.model.js';
import { MultipleQuestFoundError } from './errors.js';

/**
 * @module CombinedCourseApi
 */

/**
 * @function
 * @name getByCampaignId
 *
 * @param {number} campaignId
 * @returns {Promise<CombinedCourse>}
 */
export const getByCampaignId = async (campaignId) => {
  const courses = await usecases.findCombinedCourseByCampaignId({ campaignId });

  if (courses.length === 0) {
    return null;
  }
  if (courses.length > 1) {
    throw new MultipleQuestFoundError('Campaign is referenced in multiple Combined courses');
  }
  return new CombinedCourse(courses[0]);
};

export const findCombinedCourseIdsByOrganizationId = async (organizationId) => {
  return usecases.findCombinedCourseIdsByOrganizationId({ organizationId });
};
