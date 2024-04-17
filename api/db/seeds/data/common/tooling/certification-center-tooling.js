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
 * @param {Array<{id: number, role: string}>} members
 * @param {boolean} isV3Pilot
 * @param {Array<number>} complementaryCertificationIds
 * @param {Array<number>} featureIds
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
  members = [],
  isV3Pilot = false,
  complementaryCertificationIds = [],
  featureIds = [],
}) {
  certificationCenterId = _buildCertificationCenter({
    databaseBuilder,
    certificationCenterId,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
    isV3Pilot,
  }).id;
  _buildCertificationCenterFeatures({
    databaseBuilder,
    certificationCenterId,
    featureIds,
  });

  _buildCertificationCenterMemberships({
    databaseBuilder,
    certificationCenterId,
    members,
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

function _buildCertificationCenterMemberships({ databaseBuilder, certificationCenterId, members }) {
  members.forEach(({ id, role }) =>
    databaseBuilder.factory.buildCertificationCenterMembership({
      userId: id,
      role,
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
  return databaseBuilder.factory.buildCertificationCenter({
    id: certificationCenterId,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
    isV3Pilot,
  });
}

function _buildCertificationCenterFeatures({ databaseBuilder, certificationCenterId, featureIds }) {
  featureIds.forEach((featureId) =>
    databaseBuilder.factory.buildCertificationCenterFeature({
      certificationCenterId,
      featureId,
    }),
  );
}
