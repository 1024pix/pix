import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as campaignParticipationOverviewRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import * as libOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { findOrganizationLearnersWithParticipations } from '../../domain/usecases/find-organization-learners-with-participations.js';
import { getOrganizationLearnerWithParticipations } from '../../domain/usecases/get-organization-learner-with-participations.js';
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
 * @property {number} id
 * @property {number} targetProfileId
 * @property {string} status
 * @property {string} campaignName
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
  const organizationLearnersWithParticipations = await findOrganizationLearnersWithParticipations({
    userIds,
    campaignParticipationOverviewRepository,
    tagRepository,
    libOrganizationLearnerRepository,
    organizationRepository,
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

export async function getByUserIdAndOrganizationId({ userId, organizationId }) {
  const organizationLearnerWithParticipation = await getOrganizationLearnerWithParticipations({
    userId,
    organizationId,
    organizationLearnerRepository,
    organizationRepository,
    tagRepository,
    campaignParticipationOverviewRepository,
  });
  return new OrganizationLearnerWithParticipations(organizationLearnerWithParticipation);
}
