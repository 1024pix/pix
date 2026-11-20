import { findCampaignIdsByCombinedCourseIds as findCampaignIdsByCombinedCourseIdsUsecase } from '../../domain/usecases/find-campaign-ids-by-combined-course-ids.js';
import { findCombinedCourseByCampaignId } from '../../domain/usecases/find-combined-course-by-campaign-id.js';
import { findCombinedCourseIdsByOrganizationId as findCombinedCourseIdsByOrganizationIdUsecase } from '../../domain/usecases/find-combined-course-ids-by-organization-id.js';
import { getCombinedCourseExistsForCampaignId } from '../../domain/usecases/get-combined-course-exists-for-campaign-id.js';
import * as campaignRepository from '../../infrastructure/repositories/combined-courses/campaign-repository.js';
import * as combinedCourseRepository from '../../infrastructure/repositories/combined-courses/combined-course-repository.js';
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
  const courses = await findCombinedCourseByCampaignId({ campaignId, combinedCourseRepository });

  if (courses.length === 0) {
    return null;
  }
  if (courses.length > 1) {
    throw new MultipleQuestFoundError('Campaign is referenced in multiple Combined courses');
  }
  return new CombinedCourse(courses[0]);
};

export const existsForCampaignId = async (campaignId) => {
  return getCombinedCourseExistsForCampaignId({ campaignId, combinedCourseRepository });
};

export const findCombinedCourseIdsByOrganizationId = async (organizationId) => {
  return findCombinedCourseIdsByOrganizationIdUsecase({ organizationId, combinedCourseRepository });
};

export const findCampaignIdsByCombinedCourseIds = async (combinedCourseIds) => {
  return findCampaignIdsByCombinedCourseIdsUsecase({ combinedCourseIds, campaignRepository });
};
