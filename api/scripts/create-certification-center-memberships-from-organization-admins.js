'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');

const { checkCsvExtensionFile, parseCsvWithHeader } = require('./helpers/csvHelpers');

const Membership = require('../lib/domain/models/Membership');

const { knex } = require('../lib/infrastructure/bookshelf');

async function getCertificationCenterIdWithMembershipsUserIdByExternalId(externalId) {
  const certificationCenterIdWithMemberships = await knex('certification-centers')
    .select('certification-centers.id', 'certification-center-memberships.userId')
    .leftJoin('certification-center-memberships', 'certification-centers.id', 'certification-center-memberships.certificationCenterId')
    .where('certification-centers.externalId', '=', externalId);

  return { id: certificationCenterIdWithMemberships[0].id,
    certificationCenterMemberships: _(certificationCenterIdWithMemberships)
      .map((certificationCenterMembership) => certificationCenterMembership.userId)
      .compact()
      .value(),
  };
}

async function getAdminMembershipsUserIdByOrganizationExternalId(externalId) {
  const adminMemberships = await knex('memberships')
    .select('memberships.userId')
    .innerJoin('organizations', 'memberships.organizationId', 'organizations.id')
    .where('organizationRole', Membership.roles.ADMIN)
    .where('organizations.externalId', '=', externalId);

  return adminMemberships.map((adminMembership) => adminMembership.userId);
}

function buildCertificationCenterMemberships({ certificationCenterId, membershipUserIds }) {
  return membershipUserIds.map((userId) => {
    return { certificationCenterId, userId };
  });
}

async function fetchCertificationCenterMembershipsByExternalId(externalId) {
  const certificationCenter = await getCertificationCenterIdWithMembershipsUserIdByExternalId(externalId);
  const membershipUserIds = await getAdminMembershipsUserIdByOrganizationExternalId(externalId);
  const missingMemberships = _.filter(membershipUserIds, (userId) => {
    return !certificationCenter.certificationCenterMemberships.includes(userId);
  });
  return buildCertificationCenterMemberships({
    certificationCenterId: certificationCenter.id,
    membershipUserIds: missingMemberships,
  });
}

async function prepareDataForInsert(rawExternalIds) {
  const externalIds = _.uniq(_.map(rawExternalIds, 'externalId'));
  const certificationCenterMembershipsLists = await bluebird.mapSeries(externalIds, fetchCertificationCenterMembershipsByExternalId);
  return certificationCenterMembershipsLists.flat();
}

async function createCertificationCenterMemberships(certificationCenterMemberships) {
  return knex.batchInsert('certification-center-memberships', certificationCenterMemberships);
}

async function main() {
  console.log('Starting creating Certification Center memberships with a list of ExternalIds.');

  try {
    const filePath = process.argv[2];

    console.log('Check csv extension file... ');
    checkCsvExtensionFile(filePath);
    console.log('ok');

    console.log('Reading and parsing csv data file... ');
    const csvData = await parseCsvWithHeader(filePath);
    console.log('ok');

    console.log('Data preparation before insertion into the database...');
    const certificationCenterMemberships = await prepareDataForInsert(csvData);
    console.log('ok');

    console.log('Creating Certification Center Memberships into database...');
    await createCertificationCenterMemberships(certificationCenterMemberships);
    console.log('\nDone.');

  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = {
  getCertificationCenterIdWithMembershipsUserIdByExternalId,
  getAdminMembershipsUserIdByOrganizationExternalId,
  buildCertificationCenterMemberships,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships,
};
