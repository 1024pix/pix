import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(scoBlockedAccessDate) {
  return new Serializer('sco-blocked-access-dates', {
    attributes: ['reopeningDate'],
    transform: (record) => {
      return {
        ...record,
        id: record.scoOrganizationTagName,
      };
    },
  }).serialize(scoBlockedAccessDate);
}
