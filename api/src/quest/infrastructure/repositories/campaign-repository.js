import { Campaign } from '../../domain/models/Campaign.js';

import * as injectedCampaignsApi from '../../../prescription/campaign/application/api/campaigns-api.js';

export const getByCode = async function({ code, campaignsApi = injectedCampaignsApi } = {}) {
  const campaign = await campaignsApi.getByCode(code);
  return new Campaign(campaign);
};

export const get = async function({ id, campaignsApi = injectedCampaignsApi } = {}) {
  const campaign = await campaignsApi.get(id);
  return new Campaign(campaign);
};
