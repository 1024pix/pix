import DomainTransaction from '../../lib/infrastructure/DomainTransaction';
import { MembershipUpdateError, UserCantBeCreatedError, ForbiddenAccess } from '../../lib/domain/errors';
import times from 'lodash/times';
import { knex, disconnect } from '../../db/knex-database-connection';

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
    lastPixOrgaTermsOfServiceValidatedAt: null,
    lastPixCertifTermsOfServiceValidatedAt: null,
    mustValidateTermsOfService: false,
    pixOrgaTermsOfServiceAccepted: false,
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
    await knex.batchInsert('users', manyUsers).transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch (err) {
    throw new UserCantBeCreatedError();
  }

  const manyMemberShips = times(numberOfUsers, _buildMembership);

  try {
    await knex
      .batchInsert('memberships', manyMemberShips)
      .transacting(DomainTransaction.emptyTransaction().knexTransaction);
  } catch (err) {
    throw new MembershipUpdateError();
  }
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const numberOfUsers = process.argv[2];
  const organizationId = process.argv[3];
  const memberRole = process.argv[4];
  const initialIdStart = parseInt(process.argv[5]) || INITIAL_ID;
  console.log(
    `Starting adding ${numberOfUsers} users with ${memberRole} role to organization with id ${organizationId}`
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
      await disconnect();
    }
  }
})();

export default {
  addManyMembersToExistingOrganization,
};
