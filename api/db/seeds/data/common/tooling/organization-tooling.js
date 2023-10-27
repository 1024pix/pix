export { createOrganization };

/**
 * Fonction générique pour créer une organisation selon une configuration donnée.
 * Retourne l'ID de l'organisation.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} organizationId
 * @param {string} type
 * @param {string} name
 * @param {string} logoUrl
 * @param {string} externalId
 * @param {string} provinceCode
 * @param {boolean} isManagingStudents
 * @param {number} credit
 * @param {Date} createdAt
 * @param {Date} updatedAt
 * @param {email} email
 * @param {string} documentationUrl
 * @param {number} createdBy
 * @param {boolean} showNPS
 * @param {string} formNPSUrl
 * @param {boolean} showSkills
 * @param {number} archivedBy
 * @param {Date} archivedAt
 * @param {string} identityProviderForCampaigns
 * @param {number} adminUserId
 * @param {Array<number>} adminIds
 * @param {Array<number>} memberIds
 * @param {Array<number>} tagIds
 * @param {Array<number>} featureIds
 * @param configOrganization {learnerCount: number }
 * @returns {Promise<{organizationId: number}>}
 */
async function createOrganization({
  databaseBuilder,
  organizationId,
  type,
  name,
  logoUrl,
  externalId,
  provinceCode,
  isManagingStudents,
  credit,
  createdAt,
  updatedAt,
  email,
  documentationUrl,
  createdBy,
  showNPS,
  formNPSUrl,
  showSkills,
  archivedBy,
  archivedAt,
  identityProviderForCampaigns,
  adminIds = [],
  memberIds = [],
  tagIds = [],
  featureIds = [],
  configOrganization,
}) {
  organizationId = _buildOrganization({
    databaseBuilder,
    organizationId,
    type,
    name,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    createdAt,
    updatedAt,
    email,
    documentationUrl,
    createdBy,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedBy,
    archivedAt,
    identityProviderForCampaigns,
  }).id;

  _buildMemberships({
    databaseBuilder,
    organizationId,
    adminIds,
    memberIds,
  });

  _buildOrganizationTags({
    databaseBuilder,
    tagIds,
    organizationId,
  });

  _buildOrganizationFeatures({
    databaseBuilder,
    organizationId,
    featureIds,
  });

  _buildOrganizationLearners({
    databaseBuilder,
    organizationId,
    configOrganization,
  });

  await databaseBuilder.commit();
  return { organizationId };
}

function _buildOrganizationLearners({ databaseBuilder, organizationId, configOrganization }) {
  const divisions = ['1ere A', '2nde B', 'Terminale C'];
  if (configOrganization && configOrganization.learnerCount > 0) {
    for (let index = 0; index < configOrganization.learnerCount; index++) {
      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        firstName: `first-name${index}`,
        lastName: `last-name${index}`,
        email: `learneremail${organizationId}_${index}@example.net`,
        cgu: true,
        lastTermsOfServiceValidatedAt: new Date(),
        mustValidateTermsOfService: false,
        hasSeenAssessmentInstructions: true,
        shouldChangePassword: false,
      }).id;
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: `first-name${index}`,
        lastName: `last-name${index}`,
        sex: 'M',
        birthdate: '2000-01-01',
        birthCity: null,
        birthCityCode: '75115',
        birthCountryCode: '100',
        birthProvinceCode: null,
        division: divisions[index % divisions.length],
        isDisabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId,
        userId,
      });
    }
  }
}

function _buildOrganizationFeatures({ databaseBuilder, organizationId, featureIds }) {
  featureIds.forEach((featureId) =>
    databaseBuilder.factory.buildOrganizationFeature({
      organizationId,
      featureId,
    }),
  );
}

function _buildOrganizationTags({ databaseBuilder, organizationId, tagIds }) {
  tagIds.forEach((tagId) =>
    databaseBuilder.factory.buildOrganizationTag({
      organizationId,
      tagId,
    }),
  );
}

function _buildMemberships({ databaseBuilder, organizationId, adminIds, memberIds }) {
  adminIds.forEach((adminId) =>
    databaseBuilder.factory.buildMembership({
      userId: adminId,
      organizationId,
      organizationRole: 'ADMIN',
    }),
  );

  memberIds.forEach((memberId) =>
    databaseBuilder.factory.buildMembership({
      userId: memberId,
      organizationId,
      organizationRole: 'MEMBER',
    }),
  );
}

function _buildOrganization({
  databaseBuilder,
  organizationId,
  type,
  name,
  logoUrl,
  externalId,
  provinceCode,
  isManagingStudents,
  credit,
  createdAt,
  updatedAt,
  email,
  documentationUrl,
  createdBy,
  showNPS,
  formNPSUrl,
  showSkills,
  archivedBy,
  archivedAt,
  identityProviderForCampaigns,
}) {
  return databaseBuilder.factory.buildOrganization({
    id: organizationId,
    type,
    name,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    createdAt,
    updatedAt,
    email,
    documentationUrl,
    createdBy,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedBy,
    archivedAt,
    identityProviderForCampaigns,
  });
}
