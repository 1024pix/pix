import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serializeWithTargetProfilesHistory(certificationFramework) {
  return new Serializer('certification-framework', {
    transform: function (record) {
      const targetProfilesHistory = record.targetProfilesHistory ?? [];
      return {
        id: record.key,
        name: record.key,
        targetProfilesHistory: targetProfilesHistory.map((targetProfile) => ({
          id: targetProfile.id,
          name: targetProfile.name,
          attachedAt: targetProfile.attachedAt,
          detachedAt: targetProfile.detachedAt,
        })),
      };
    },
    attributes: ['name', 'targetProfilesHistory'],
  }).serialize(certificationFramework);
}
