import { Serializer } from 'jsonapi-serializer';

export default {
  serialize({ organizationParticipants, meta }) {
    return new Serializer('organization-participants', {
      id: 'id',
      attributes: [
        'firstName',
        'lastName',
        'participationCount',
        'lastParticipationDate',
        'campaignName',
        'campaignType',
        'participationStatus',
        'isCertifiable',
        'certifiableAt',
      ],
      meta,
    }).serialize(organizationParticipants);
  },
};
