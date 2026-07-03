import { config } from '../../../shared/config.js';
import { AutonomousCourse } from '../../domain/models/AutonomousCourse.js';

/**
 * @param {AutonomousCourse} autonomousCourse
 * @param {CampaignApi} campaignApi
 * @returns {Promise<number>} returns the created campaign id
 */
export async function save({ autonomousCourse, campaignApi }) {
  const { id } = await campaignApi.save({
    name: autonomousCourse.internalTitle,
    title: autonomousCourse.publicTitle,
    targetProfileId: autonomousCourse.targetProfileId,
    organizationId: config.autonomousCourse.autonomousCoursesOrganizationId,
    creatorId: autonomousCourse.ownerId,
    customLandingPageText: autonomousCourse.customLandingPageText,
  });

  return id;
}

export async function update({ autonomousCourse, campaignApi }) {
  return await campaignApi.update({
    campaignId: autonomousCourse.campaignId,
    name: autonomousCourse.internalTitle,
    title: autonomousCourse.publicTitle,
    customLandingPageText: autonomousCourse.customLandingPageText,
  });
}

/**
 * @typedef AutonomousCourse
 * @type {object}
 * @property {number} id
 * @property {string} internalTitle
 * @property {string} publicTitle
 * @property {string} customLandingPageText
 * @property {string} createdAt
 * @property {string} code
 */

/**
 * @param {AutonomousCourseDTO} AutonomousCourseDTO
 * @returns {AutonomousCourse}
 */
function _toDomain(AutonomousCourseDTO) {
  return new AutonomousCourse(AutonomousCourseDTO);
}

export async function get({ autonomousCourseId, campaignApi }) {
  const autonomousCourse = await campaignApi.get(autonomousCourseId);

  const autonomousCourseDTO = {
    id: autonomousCourse.id,
    internalTitle: autonomousCourse.name,
    publicTitle: autonomousCourse.title,
    customLandingPageText: autonomousCourse.customLandingPageText,
    createdAt: autonomousCourse.createdAt,
    code: autonomousCourse.code,
  };

  return _toDomain(autonomousCourseDTO);
}

/**
 * @param {Object} page custom pagination properties
 * @param {number} page.size pagination items per page
 * @param {number} page.number current pagination page
 * @param {CampaignApi} campaignApi prescription campaign API
 * @returns {Promise<{autonomousCourses: Array<CampaignListItem>, meta: { page: number, pageSize: number, rowCount: number, pageCount: number} }>} returns a paginated list of autonomous courses
 */
export async function findAllPaginated({ page, campaignApi }) {
  const { models: autonomousCourses, meta } = await campaignApi.findAllSummariesForOrganization({
    organizationId: config.autonomousCourse.autonomousCoursesOrganizationId,
    page,
  });
  return { autonomousCourses, meta };
}
