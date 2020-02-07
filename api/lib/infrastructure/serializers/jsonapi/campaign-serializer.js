const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(campaigns, meta, { tokenForCampaignResults, ignoreCampaignReportRelationshipData = true } = {}) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'title', 'createdAt', 'customLandingPageText', 'tokenForCampaignResults', 'idPixLabel', 'organizationLogoUrl', 'organizationName', 'targetProfile', 'campaignReport', 'campaignCollectiveResult', 'isRestricted', 'creator'],
      typeForAttribute(attribute) {
        if (attribute === 'creator') {
          return 'users';
        }
      },
      transform: (record) => {
        const campaign = Object.assign({}, record);
        campaign.tokenForCampaignResults = tokenForCampaignResults;
        return campaign;
      },
      targetProfile: {
        ref: 'id',
        included: true,
        attributes: ['name']
      },
      campaignReport: {
        ref: 'id',
        attributes: ['participationsCount', 'sharedParticipationsCount'],
        ignoreRelationshipData: ignoreCampaignReportRelationshipData,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/campaign-report`;
          }
        }
      },
      creator: {
        ref: 'id',
        type: 'users',
        attributes: ['lastName', 'firstName'],
        included: true,
      },
      campaignCollectiveResult: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/collective-results`;
          }
        }
      },
      meta,
    }).serialize(campaigns);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaign) => {
        campaign.targetProfileId = parseInt(_.get(json.data, ['relationships', 'target-profile', 'data', 'id']));
        return new Campaign(campaign);
      });
  }

};

