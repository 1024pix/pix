import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignReports, meta, { tokenForCampaignResults } = {}) {
  return new Serializer('campaign', {
    transform: (record) => {
      const campaign = Object.assign({}, record);
      campaign.tokenForCampaignResults = tokenForCampaignResults;
      campaign.isArchived = record.isArchived;
      return campaign;
    },
    attributes: [
      'name',
      'code',
      'title',
      'type',
      'createdAt',
      'customLandingPageText',
      'isArchived',
      'tokenForCampaignResults',
      'idPixLabel',
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
      'divisions',
      'stages',
      'totalStage',
      'reachedStage',
      'badges',
      'groups',
      'multipleSendings',
    ],
    stages: {
      ref: 'id',
      included: true,
      attributes: ['prescriberTitle', 'prescriberDescription', 'threshold'],
    },
    badges: {
      ref: 'id',
      included: true,
      attributes: ['title'],
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
    meta,
  }).serialize(campaignReports);
};

export { serialize };
