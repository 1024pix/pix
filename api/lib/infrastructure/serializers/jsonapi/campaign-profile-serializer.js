import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(campaignProfile) {
    return new Serializer('campaign-profiles', {
      id: 'campaignParticipationId',
      attributes: [
        'firstName',
        'lastName',
        'externalId',
        'createdAt',
        'sharedAt',
        'isShared',
        'campaignId',
        'pixScore',
        'competencesCount',
        'certifiableCompetencesCount',
        'isCertifiable',
        'competences',
      ],
      typeForAttribute: (attribute) => {
        if (attribute === 'competences') return 'campaign-profile-competences';
      },
      competences: {
        ref: 'id',
        attributes: ['name', 'index', 'pixScore', 'estimatedLevel', 'areaColor'],
      },
    }).serialize(campaignProfile);
  },
};
