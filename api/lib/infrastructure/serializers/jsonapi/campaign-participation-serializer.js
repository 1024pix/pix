const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const CampaignParticipation = require('../../../domain/models/CampaignParticipation');

module.exports = {

  serialize(campaignParticipation) {
    return new Serializer('campaign-participation',
      {
        transform: (campaignParticipation) => {
          if (!campaignParticipation.user) {
            delete campaignParticipation.user;
          }
          const campaignParticipationForSerialization = Object.assign({}, campaignParticipation);

          if (campaignParticipation.lastAssessment) {
            campaignParticipationForSerialization.assessment = { id: campaignParticipation.lastAssessment.id };
          } else if (campaignParticipation.assessmentId) {
            // FIXME: This ugly hack must me removed once all usage of this magical assessmentId property is deprecated
            // FIXME: in favor of the lastAssessment getter. Currently, the repository adds this prop in a very brittle way.
            campaignParticipationForSerialization.assessment = { id: campaignParticipation.assessmentId };
          }
          return campaignParticipationForSerialization;
        },

        attributes: ['isShared', 'sharedAt', 'createdAt', 'participantExternalId', 'campaign', 'user', 'campaignParticipationResult', 'assessment', 'campaignAnalysis'],
        campaign: {
          ref: 'id',
          attributes: ['code', 'title', 'type'],
        },
        user: {
          ref: 'id',
          attributes: ['firstName', 'lastName'],
        },
        assessment: {
          ref: 'id',
          ignoreRelationshipData: true,
          relationshipLinks: {
            related(record) {
              return `/api/assessments/${record.assessment.id}`;
            },
          },
        },
        campaignParticipationResult: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related(record, current, parent) {
              return `/api/campaign-participations/${parent.id}/campaign-participation-result`;
            },
          },
        },
        campaignAnalysis: {
          ref: 'id',
          ignoreRelationshipData: true,
          nullIfMissing: true,
          relationshipLinks: {
            related(record, current, parent) {
              return `/api/campaign-participations/${parent.id}/analyses`;
            },
          },
        },
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
