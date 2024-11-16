const indexesToAdd = [
  { tableName: 'certification-subscriptions', index: ['complementaryCertificationId', 'certificationCandidateId'] },
  { tableName: 'complementary-certifications', index: ['key'] },
  { tableName: 'features', index: ['key'] },
  { tableName: 'campaign-features', index: ['campaignId', 'featureId'] },
  { tableName: 'complementary-certification-habilitations', index: ['certificationCenterId'] },
  { tableName: 'complementary-certification-badges', index: ['complementaryCertificationId'] },
  { tableName: 'complementary-certification-courses', index: ['complementaryCertificationBadgeId'] },
  { tableName: 'organizations', index: ['externalId'] },
  { tableName: 'organization-learners', index: ['organizationId', 'division'] },
];

const up = async function (knex) {
  for (const { tableName, index } of indexesToAdd) {
    await knex.schema.table(tableName, function (table) {
      table.index(index);
    });
  }
};

const down = async function (knex) {
  for (const { tableName, index } of indexesToAdd) {
    await knex.schema.table(tableName, function (table) {
      table.dropIndex(index);
    });
  }
};
export { down, up };
