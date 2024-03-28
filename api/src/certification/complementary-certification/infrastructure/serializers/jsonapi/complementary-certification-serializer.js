import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeForAdmin = function (complementaryCertification) {
  return new Serializer('complementary-certification', {
    transform: function (complementaryCertification) {
      const targetProfilesHistory = complementaryCertification.targetProfilesHistory ?? [];
      return {
        id: complementaryCertification.id,
        label: complementaryCertification.label,
        hasExternalJury: complementaryCertification.hasExternalJury,
        targetProfilesHistory: targetProfilesHistory.map((targetProfile) => ({
          id: targetProfile.id,
          name: targetProfile.name,
          attachedAt: targetProfile.attachedAt,
          detachedAt: targetProfile.detachedAt,
          badges: targetProfile.badges?.map((badge) => ({
            id: badge.id,
            label: badge.label,
            level: badge.level,
            imageUrl: badge.imageUrl,
            minimumEarnedPix: badge.minimumEarnedPix,
          })),
        })),
      };
    },
    attributes: ['label', 'hasExternalJury', 'targetProfilesHistory'],
  }).serialize(complementaryCertification);
};

export { serializeForAdmin };
