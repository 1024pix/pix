const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(campaigns, meta, { tokenForCampaignResults, ignoreCampaignReportRelationshipData = true } = {}) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'title', 'type', 'createdAt', 'customLandingPageText', 'archivedAt',
        'tokenForCampaignResults', 'idPixLabel', 'externalIdHelpImageUrl', 'alternativeTextToExternalIdHelpImage', 'organizationLogoUrl', 'organizationName', 'organizationType', 'targetProfile',
        'campaignReport', 'campaignCollectiveResult', 'isRestricted', 'creator', 'campaignAnalysis'],
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
        attributes: ['name', 'imageUrl', 'hasBadges'],
      },
      campaignReport: {
        ref: 'id',
        attributes: ['participationsCount', 'sharedParticipationsCount'],
        ignoreRelationshipData: ignoreCampaignReportRelationshipData,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/campaign-report`;
          },
        },
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
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/collective-results`;
          },
        },
      },
      campaignAnalysis: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/analyses`;
          },
        },
      },
      meta,
    }).serialize(campaigns);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaign) => {
        campaign.organizationId = parseInt(_.get(json.data, ['attributes', 'organization-id']));
        const targetProfileId = _.get(json.data, ['relationships', 'target-profile', 'data', 'id']);
        if (targetProfileId) {
          campaign.targetProfileId = parseInt(targetProfileId);
        }
        return new Campaign(campaign);
      });
  },

};

