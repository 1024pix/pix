import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { SavedCampaign } from './SavedCampaign.js';
import { Campaign } from './Campaign.js';
/**
 * @typedef CampaignApi
 * @type {object}
 * @function save
 * @function get
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
 * @returns {Promise<SavedCampaign>}
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

/**
 * @function
 * @name get
 *
 * @param {number} campaignId
 * @returns {Promise<Campaign>}
 */
export const get = async (campaignId) => {
  const getCampaign = await usecases.getCampaign({ campaignId });
  return new Campaign(getCampaign);
};
