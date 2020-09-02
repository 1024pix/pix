const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignAssessmentParticipation) {
    return new Serializer('campaign-assessment-participations', {
      id: 'campaignParticipationId',
      attributes: [
        'firstName',
        'lastName',
        'participantExternalId',
        'createdAt',
        'sharedAt',
        'isShared',
        'campaignId',
        'totalSkillsCount',
        'validatedSkillsCount',
        'masteryPercentage',
        'progression',
        'campaignAssessmentParticipationResult',
        'campaignAnalysis',
      ],
      campaignAssessmentParticipationResult: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${record.campaignId}/assessment-participations/${parent.id}/results`;
          }
        },
      },
      campaignAnalysis: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaign-participations/${parent.id}/analyses`;
          }
        }
      },
    }).serialize(campaignAssessmentParticipation);
  },
};
