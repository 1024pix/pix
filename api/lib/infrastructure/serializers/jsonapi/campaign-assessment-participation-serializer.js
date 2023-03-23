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
        'targetedSkillsCount',
        'validatedSkillsCount',
        'masteryRate',
        'progression',
        'badges',
        'campaignAssessmentParticipationResult',
        'campaignAnalysis',
        'reachedStage',
        'totalStage',
        'prescriberTitle',
        'prescriberDescription',
        'organizationLearnerId',
      ],
      badges: {
        ref: 'id',
        included: true,
        attributes: ['title', 'altMessage', 'imageUrl'],
      },
      campaignAssessmentParticipationResult: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record) {
            return `/api/campaigns/${record.campaignId}/assessment-participations/${record.campaignParticipationId}/results`;
          },
        },
      },
      campaignAnalysis: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record) {
            return `/api/campaign-participations/${record.campaignParticipationId}/analyses`;
          },
        },
      },
    }).serialize(campaignAssessmentParticipation);
  },
};
