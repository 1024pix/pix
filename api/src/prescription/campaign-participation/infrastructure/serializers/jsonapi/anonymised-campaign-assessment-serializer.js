import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (anonymisedCampaignAssessment, meta) {
  return new Serializer('anonymised-campaign-assessment', {
    attributes: ['state', 'updatedAt'],
    meta,
  }).serialize(anonymisedCampaignAssessment);
};

export const anonymisedCampaignAssessmentSerializer = { serialize };
