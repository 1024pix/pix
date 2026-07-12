import lodash from 'lodash';

import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import { MembershipUpdateError } from '../../src/shared/domain/errors.js';
const { times } = lodash;
import * as url from 'node:url';

import { databaseConnections } from '../../db/database-connections.js';
import { getDb } from '../../db/knex-database-connection.js';
import { UserCantBeCreatedError } from '../../src/identity-access-management/domain/errors.js';
import { ForbiddenAccess } from '../../src/shared/domain/errors.js';

const INITIAL_ID = 300000;

function _buildMembership(iteration) {
  const organizationId = process.argv[3];
  const memberRole = process.argv[4];
  const initialIdStart = parseInt(process.argv[5]) || INITIAL_ID;

  return {
    organizationRole: memberRole,
    organizationId: organizationId,
    userId: initialIdStart + iteration,
    disabledAt: null,
  };
}

function _buildUser(iteration) {
  const initialIdStart = parseInt(process.argv[5]) || INITIAL_ID;
  return {
    firstName: `firstName${initialIdStart + iteration}`,
    lastName: `lastName${initialIdStart + iteration}`,
    email: `firstname.lastname-${initialIdStart + iteration}@example.net`,
    id: initialIdStart + iteration,
    cgu: true,
    lastPixCertifTermsOfServiceValidatedAt: null,
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
    isAnonymous: true,
  };
}

async function addManyMembersToExistingOrganization({ numberOfUsers }) {
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenAccess();
  }

  const manyUsers = times(numberOfUsers, _buildUser);

  try {
    await getDb().batchInsert('users', manyUsers).transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch {
    throw new UserCantBeCreatedError();
  }

  const manyMemberShips = times(numberOfUsers, _buildMembership);

  try {
    await getDb()
      .batchInsert('memberships', manyMemberShips)
      .transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch {
    throw new MembershipUpdateError();
  }
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const numberOfUsers = process.argv[2];
  const organizationId = process.argv[3];
  const memberRole = process.argv[4];
  const initialIdStart = parseInt(process.argv[5]) || INITIAL_ID;
  console.log(
    `Starting adding ${numberOfUsers} users with ${memberRole} role to organization with id ${organizationId}`,
  );
  console.log(`User ids starting at ${initialIdStart}`);

  await addManyMembersToExistingOrganization({ numberOfUsers });

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
      await databaseConnections.disconnect();
    }
  }
})();

export { addManyMembersToExistingOrganization };
