export { createCertificationCenter };

/**
 * Fonction générique pour créer un centre de certification selon une configuration donnée.
 * Retourne l'ID du centre de certification.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} certificationCenterId
 * @param {string} name
 * @param {string} type
 * @param {string} externalId
 * @param {Date} createdAt
 * @param {Date} updatedAt
 * @param {Array<number>} memberIds
 * @param {boolean} isV3Pilot
 * @param {Array<number>} complementaryCertificationIds
 * @returns {Promise<{certificationCenterId: number}>}
 */
async function createCertificationCenter({
  databaseBuilder,
  certificationCenterId,
  name,
  type,
  externalId,
  createdAt,
  updatedAt,
  memberIds = [],
  isV3Pilot = false,
  complementaryCertificationIds,
}) {
  _buildCertificationCenter({
    databaseBuilder,
    certificationCenterId,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
    isV3Pilot,
  });

  _buildCertificationCenterMemberships({
    databaseBuilder,
    certificationCenterId,
    memberIds,
  });

  _buildCertificationCenterHabilitations({
    databaseBuilder,
    certificationCenterId,
    complementaryCertificationIds,
  });

  await databaseBuilder.commit();
  return { certificationCenterId };
}

function _buildCertificationCenterHabilitations({
  databaseBuilder,
  certificationCenterId,
  complementaryCertificationIds,
}) {
  complementaryCertificationIds.forEach((complementaryCertificationId) =>
    databaseBuilder.factory.buildComplementaryCertificationHabilitation({
      certificationCenterId,
      complementaryCertificationId,
    }),
  );
}

function _buildCertificationCenterMemberships({ databaseBuilder, certificationCenterId, memberIds }) {
  memberIds.forEach((memberId) =>
    databaseBuilder.factory.buildCertificationCenterMembership({
      userId: memberId,
      certificationCenterId,
      createdAt: new Date(),
      isReferer: false,
    }),
  );
}

function _buildCertificationCenter({
  databaseBuilder,
  certificationCenterId,
  name,
  type,
  externalId,
  isV3Pilot,
  createdAt,
  updatedAt,
}) {
  databaseBuilder.factory.buildCertificationCenter({
    id: certificationCenterId,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
    isV3Pilot,
  });
}
