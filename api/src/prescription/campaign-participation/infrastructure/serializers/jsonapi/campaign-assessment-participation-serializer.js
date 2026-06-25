import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignAssessmentParticipation) {
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
      'campaignParticipationLevelsPerTubesAndCompetence',
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
    campaignParticipationLevelsPerTubesAndCompetence: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record) {
          return `/api/campaign-participations/${record.campaignParticipationId}/level-per-tubes-and-competences`;
        },
      },
    },
  }).serialize(campaignAssessmentParticipation);
};

export const campaignAssessmentParticipationSerializer = { serialize };
