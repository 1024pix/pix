'use strict';

const _ = require('lodash');

const { checkCsvExtensionFile, parseCsvWithHeader } = require('./helpers/csvHelpers');

const { NotFoundError } = require('../lib/domain/errors');
const Membership = require('../lib/domain/models/Membership');

const Bookshelf = require('../lib/infrastructure/bookshelf');
const bookshelfToDomainConverter = require('../lib/infrastructure/utils/bookshelf-to-domain-converter');
const BookshelfCertificationCenter = require('../lib/infrastructure/data/certification-center');
const BookshelfMembership = require('../lib/infrastructure/data/membership');

function getCertificationCenterByExternalId(externalId) {
  return BookshelfCertificationCenter
    .where({ externalId })
    .fetch({ require: true })
    .then((certificationCenter) => bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationCenter, certificationCenter))
    .catch((err) => {
      if (err instanceof BookshelfCertificationCenter.NotFoundError) {
        throw new NotFoundError(`CertificationCenter not found for External ID ${externalId}`);
      }
      throw err;
    });
}

async function getAdminMembershipsByOrganizationExternalId(externalId) {
  return BookshelfMembership
    .query((qb) => {
      qb.innerJoin('organizations', 'memberships.organizationId', 'organizations.id');
      qb.where('organizationRole', Membership.roles.ADMIN);
      qb.where('organizations.externalId', '=' , externalId);
    })
    .fetchAll({ require: true })
    .then((memberships) => {
      const data = memberships.models.map((model) => model.attributes);
      return data;
    })
    .catch((err) => {
      if (err instanceof BookshelfMembership.NotFoundError) {
        throw new NotFoundError(`Organization not found for External ID ${externalId}`);
      }
      throw err;
    });
}

function buildCertificationCenterMemberships({ certificationCenterId, memberships }) {
  return memberships.map((membership) => {
    return { certificationCenterId, userId: membership.userId };
  });
}

async function fetchCertificationCenterMembershipsByExternalId(externalId) {
  const { id: certificationCenterId } = await getCertificationCenterByExternalId(externalId);
  const memberships = await getAdminMembershipsByOrganizationExternalId(externalId);

  return buildCertificationCenterMemberships({ certificationCenterId, memberships });
}

function prepareDataForInsert(rawExternalIds) {
  return Promise.all(_.map(rawExternalIds, ({ externalId }) => {
    return fetchCertificationCenterMembershipsByExternalId(externalId);
  }))
    .then((certificationCenterMemberships) => {
      return _.union(...certificationCenterMemberships);
    });
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
    const csvData = parseCsvWithHeader(filePath);
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
    }
  );
}

module.exports = {
  getCertificationCenterByExternalId,
  getAdminMembershipsByOrganizationExternalId,
  buildCertificationCenterMemberships,
  fetchCertificationCenterMembershipsByExternalId,
  prepareDataForInsert,
  createCertificationCenterMemberships
};
