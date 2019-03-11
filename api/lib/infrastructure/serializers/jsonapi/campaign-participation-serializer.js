const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const CampaignParticipation = require('../../../domain/models/CampaignParticipation');

module.exports = {

  serialize(campaignParticipation, meta) {
    return new Serializer('campaign-participation', {
      attributes: ['isShared', 'sharedAt', 'createdAt', 'participantExternalId',  'campaign', 'user', 'campaignParticipationResult'],
      campaign: {
        ref: 'id',
        included: _includeRelationship(campaignParticipation, 'campaign'),
        attributes: ['code', 'title']
      },
      user: {
        ref: 'id',
        included: _includeRelationship(campaignParticipation, 'user'),
        attributes: ['firstName', 'lastName'],
      },
      campaignParticipationResult: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/campaign-participations/${parent.id}/campaign-participation-result`;
          }
        }
      },
      meta
    }).serialize(campaignParticipation);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaignParticipation) => {
        campaignParticipation.campaignId = _.get(json.data, ['relationships', 'campaign', 'data', 'id']);
        return new CampaignParticipation(campaignParticipation);
      });
  },
};

function _includeRelationship(campaignParticipation, relationshipName) {
  if (_.isEmpty(campaignParticipation)) {
    // default value for included
    return true;
  }

  const item = Array.isArray(campaignParticipation)
    ? campaignParticipation[0]
    : campaignParticipation;

  return Object.keys(item[relationshipName]).length > 1;
}
