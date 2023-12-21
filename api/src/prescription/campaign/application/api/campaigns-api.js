import { usecases } from '../../domain/usecases/index.js';
import { SavedCampaign } from './models/SavedCampaign.js';
import { Campaign } from './models/Campaign.js';
import { CampaignListItem } from './models/CampaignListItem.js';
/**
 * @module CampaignApi
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

/**
 * @typedef UpdateCampaignPayload
 * @type {object}
 * @property {number} campaignId
 * @property {string} name
 */

/**
 * @function
 * @name update
 *
 * @param {UpdateCampaignPayload} payload
 * @returns {Promise<Campaign>}
 */
export const update = async (payload) => {
  const campaignToUpdate = {
    campaignId: payload.campaignId,
    name: payload.name,
  };

  const updatedCampaign = await usecases.updateCampaign(campaignToUpdate);
  return new Campaign(updatedCampaign);
};

/**
 * @typedef PageDefinition
 * @type {object}
 * @property {number} size
 * @property {Page} number
 */

/**
 * @typedef CampaignListPayload
 * @type {object}
 * @property {number} organizationId
 * @property {PageDefinition} page
 */

/**
 * @typedef Pagination
 * @type {object}
 * @property {number} page
 * @property {number} pageSize
 * @property {number} rowCount
 * @property {number} pageCount
 */

/**
 * @typedef CampaignListResponse
 * @type {object}
 * @property {Array<CampaignListItem>} models
 * @property {Pagination} meta
 */

/**
 * @function
 * @name findAllForOrganization
 *
 * @param {CampaignListPayload} payload
 * @returns {Promise<CampaignListResponse>}
 */
export const findAllForOrganization = async (payload) => {
  const { models: campaigns, meta } = await usecases.findPaginatedFilteredOrganizationCampaigns({
    organizationId: payload.organizationId,
    page: payload.page,
  });

  const campaignsList = campaigns.map((campaign) => new CampaignListItem(campaign));

  return { models: campaignsList, meta };
};
