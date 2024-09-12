import { usecases } from '../../domain/usecases/index.js';
import { OrganizationLearnerWithParticipations } from './read-models/OrganizationLearnerWithParticipations.js';

/**
 * @module OrganizationLearnerWithParticipationsApi
 */

/**
 * @typedef FindPayload
 * @type {object}
 * @property {Array<number>} userIds
 */

/**
 * @typedef OrganizationLearner
 * @type {object}
 * @property {number} id
 * @property {string} MEFCode
 */

/**
 * @typedef Organization
 * @type {object}
 * @property {boolean} isManagingStudents
 * @property {Array<string>} tags
 * @property {string} type
 */

/**
 * @typedef CampaignParticipation
 * @type {object}
 * @property {number} targetProfileId
 */

/**
 * @typedef OrganizationLearnerWithParticipations
 * @type {object}
 * @property {OrganizationLearner} organizationLearner
 * @property {Organization} organization
 * @property {Array<CampaignParticipation>} campaignParticipations
 */

/**
 * @function
 * @name find
 * @description
 * Récupère les organizations-learners avec leurs participations à partir d'une liste d'ids d'utilisateurs
 * @param {FindPayload} payload
 * @returns {Promise<Array<OrganizationLearnerWithParticipations>>}
 */
export async function find({ userIds }) {
  const organizationLearnersWithParticipations = await usecases.findOrganizationLearnersWithParticipations({
    userIds,
  });

  return organizationLearnersWithParticipations.map(
    ({ organizationLearner, organization, campaignParticipations, tagNames }) => {
      return new OrganizationLearnerWithParticipations({
        organizationLearner,
        organization,
        campaignParticipations,
        tagNames,
      });
    },
  );
}
