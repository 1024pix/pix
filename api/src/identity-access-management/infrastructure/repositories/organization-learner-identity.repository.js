import { knex } from '../../../../db/knex-database-connection.js';
import { OrganizationLearnerIdentityNotFoundError } from '../../domain/errors.js';
import { OrganizationLearnerIdentity } from '../../domain/models/OrganizationLearnerIdentity.js';

const USER_TABLE_NAME = 'users';
const VIEW_ORGANIZATION_LEARNERS_TABLE_NAME = 'view-active-organization-learners';

async function getByIds(ids) {
  const results = await knex({
    viewOrganizationLearners: VIEW_ORGANIZATION_LEARNERS_TABLE_NAME,
  })
    .join({ users: USER_TABLE_NAME }, 'users.id', 'viewOrganizationLearners.userId')
    .select({
      id: 'viewOrganizationLearners.id',
      birthdate: 'viewOrganizationLearners.birthdate',
      division: 'viewOrganizationLearners.division',
      firstName: 'viewOrganizationLearners.firstName',
      lastName: 'viewOrganizationLearners.lastName',
      organizationId: 'viewOrganizationLearners.organizationId',
      userId: 'users.id',
      username: 'users.username',
    })
    .whereIn('viewOrganizationLearners.id', ids);

  _assertAllIdsMatchAResult({ ids, results });

  return results.map(_toDomain);
}

function _assertAllIdsMatchAResult({ ids, results }) {
  ids.forEach((id) => {
    if (!results.find((result) => result.id === id)) {
      throw new OrganizationLearnerIdentityNotFoundError(`Organization learner identity with id ${id} not found.`);
    }
  });
}

function _toDomain(organizationLearnerIdentityDTO) {
  const { id, birthdate, division, firstName, lastName, organizationId, userId, username } =
    organizationLearnerIdentityDTO;

  return new OrganizationLearnerIdentity({
    id,
    birthdate,
    division,
    firstName,
    lastName,
    organizationId,
    userId,
    username,
  });
}

const organizationLearnerIdentityRepository = {
  getByIds,
};

export { organizationLearnerIdentityRepository };
