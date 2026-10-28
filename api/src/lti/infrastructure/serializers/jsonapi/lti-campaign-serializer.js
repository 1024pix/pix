import { Serializer } from 'jsonapi-serializer';

function serialize(ltiCampaigns) {
  return new Serializer('lti-campaign', {
    attributes: ['code', 'name', 'type', 'organizationName', 'description'],
  }).serialize(ltiCampaigns);
}

export const ltiCampaignSerializer = { serialize };
