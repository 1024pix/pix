'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');

const { checkCsvExtensionFile, parseCsvWithHeader } = require('./helpers/csvHelpers');

const Membership = require('../lib/domain/models/Membership');

const Bookshelf = require('../lib/infrastructure/bookshelf');
const BookshelfCertificationCenter = require('../lib/infrastructure/data/certification-center');
const BookshelfMembership = require('../lib/infrastructure/data/membership');

async function getCertificationCenterByExternalId(externalId) {
  const bookshelfCertificationCenter = await BookshelfCertificationCenter
    .query((qb) => {
      qb.leftJoin('certification-center-memberships', 'certification-center-memberships.certificationCenterId', 'certification-centers.id');
      qb.whereNull('certification-center-memberships.id');
      qb.where('certification-centers.externalId', '=', externalId);
    })
    .fetch({ require: false });

  return bookshelfCertificationCenter ? bookshelfCertificationCenter.toJSON() : [];
}

async function getAdminMembershipsByOrganizationExternalId(externalId) {
  const bookshelfMemberships = await BookshelfMembership
    .query((qb) => {
      qb.innerJoin('organizations', 'memberships.organizationId', 'organizations.id');
      qb.where('organizationRole', Membership.roles.ADMIN);
      qb.where('organizations.externalId', '=', externalId);
    })
    .fetchAll({ require: false });

  return bookshelfMemberships ? bookshelfMemberships.toJSON() : null;
}

function buildCertificationCenterMemberships({ certificationCenterId, memberships }) {
  return memberships.map((membership) => {
    return { certificationCenterId, userId: membership.userId };
  });
}

async function fetchCertificationCenterMembershipsByExternalId(externalId) {
  const certificationCenter = await getCertificationCenterByExternalId(externalId);
  if (certificationCenter) {
    const memberships = await getAdminMembershipsByOrganizationExternalId(externalId);
    return buildCertificationCenterMemberships({ certificationCenterId: certificationCenter.id, memberships });
  }
}

async function prepareDataForInsert(rawExternalIds) {
  const externalIds = _.uniq(_.map(rawExternalIds, 'externalId'));
  const certificationCenterMembershipsLists = await bluebird.mapSeries(externalIds, fetchCertificationCenterMembershipsByExternalId);
  return certificationCenterMembershipsLists.flat();
}

async function createCertificationCenterMemberships(certificationCenterMemberships) {
  return Bookshelf.knex.batchInsert('certification-center-memberships', certificationCenterMemberships);
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
  getCertificationCenterByExternalId,
  getAdminMembershipsByOrganizationExternalId,
  buildCertificationCenterMemberships,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships,
};
