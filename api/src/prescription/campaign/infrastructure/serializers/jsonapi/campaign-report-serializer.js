import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignReports, meta) {
  return new Serializer('campaign', {
    attributes: [
      'name',
      'code',
      'title',
      'type',
      'createdAt',
      'customLandingPageText',
      'isArchived',
      'externalIdLabel',
      'externalIdType',
      'targetProfileId',
      'targetProfileDescription',
      'targetProfileName',
      'targetProfileTubesCount',
      'targetProfileThematicResultCount',
      'targetProfileHasStage',
      'targetProfileAreKnowledgeElementsResettable',
      'ownerId',
      'ownerLastName',
      'ownerFirstName',
      'participationsCount',
      'sharedParticipationsCount',
      'averageResult',
      'campaignCollectiveResult',
      'campaignAnalysis',
      'campaignResultLevelsPerTubesAndCompetence',
      'divisions',
      'stages',
      'totalStage',
      'reachedStage',
      'badges',
      'groups',
      'multipleSendings',
      'targetProfile',
      'isFromCombinedCourse',
      'combinedCourse',
    ],
    stages: {
      ref: 'id',
      included: true,
      attributes: ['prescriberTitle', 'prescriberDescription', 'threshold'],
    },
    badges: {
      ref: 'id',
      included: true,
      attributes: ['title', 'altMessage', 'imageUrl'],
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
    campaignResultLevelsPerTubesAndCompetence: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/campaigns/${parent.id}/level-per-tubes-and-competences`;
        },
      },
    },
    divisions: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/campaigns/${parent.id}/divisions`;
        },
      },
    },
    groups: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/campaigns/${parent.id}/groups`;
        },
      },
    },
    targetProfile: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/campaigns/${parent.id}/target-profile`;
        },
      },
    },
    meta,
  }).serialize(campaignReports);
};

export const campaignReportSerializer = { serialize };
