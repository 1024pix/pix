import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { SavedCampaign } from './SavedCampaign.js';

/**
 * @typedef CampaignApi
 * @type {object}
 * @function save
 */

/**
 * @typedef CampaignPayload
 * @type {object}
 * @property {string} name
 * @property {string} title
 * @property {number} targetProfileId
 * @property {number} organizationId
 * @property {number} creatorId
 * @property {string} customLandingPageText
 */

/**
 * @typedef UserNotAuthorizedToCreateCampaignError
 * @type {object}
 * @property {string} message
 */

/**
 * @function
 * @name save
 *
 * @param {CampaignPayload} campaign
 * @returns {Promise<SavedCampaignResponse>}
 * @throws {UserNotAuthorizedToCreateCampaignError} to be improved to handle different error types
 */
export const save = async (campaign) => {
  const savedCampaign = await usecases.createCampaign({
    campaign: {
      ...campaign,
      type: 'ASSESSMENT',
      ownerId: campaign.creatorId,
      multipleSendings: false,
    },
  });

  return new SavedCampaign(savedCampaign);
};
