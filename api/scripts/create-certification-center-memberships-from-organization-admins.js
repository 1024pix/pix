'use strict';

import _ from 'lodash';
import bluebird from 'bluebird';
import { parseCsvWithHeader } from './helpers/csvHelpers';
import Membership from '../lib/domain/models/Membership';
import { knex, disconnect } from '../db/knex-database-connection';

async function getCertificationCenterIdWithMembershipsUserIdByExternalId(externalId) {
  const certificationCenterIdWithMemberships = await knex('certification-centers')
    .select('certification-centers.id', 'certification-center-memberships.userId')
    .leftJoin(
      'certification-center-memberships',
      'certification-centers.id',
      'certification-center-memberships.certificationCenterId'
    )
    .where('certification-centers.externalId', '=', externalId);

  return {
    id: certificationCenterIdWithMemberships[0].id,
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
    .innerJoin('users', 'users.id', 'memberships.userId')
    .where('organizationRole', Membership.roles.ADMIN)
    .whereNull('memberships.disabledAt')
    .where('organizations.externalId', '=', externalId)
    .where('users.firstName', '!~', 'prenom_.*\\d')
    .where('users.lastName', '!~', 'nom_.*\\d');

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
  const certificationCenterMembershipsLists = await bluebird.mapSeries(
    externalIds,
    fetchCertificationCenterMembershipsByExternalId
  );
  return certificationCenterMembershipsLists.flat();
}

async function createCertificationCenterMemberships(certificationCenterMemberships) {
  return knex.batchInsert('certification-center-memberships', certificationCenterMemberships);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating Certification Center memberships with a list of ExternalIds.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsvWithHeader(filePath);
  console.log('ok');

  console.log('Data preparation before insertion into the database...');
  const certificationCenterMemberships = await prepareDataForInsert(csvData);
  console.log('ok');

  console.log('Creating Certification Center Memberships into database...');
  await createCertificationCenterMemberships(certificationCenterMemberships);
  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  getCertificationCenterIdWithMembershipsUserIdByExternalId,
  getAdminMembershipsUserIdByOrganizationExternalId,
  buildCertificationCenterMemberships,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships,
};
