import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { OrganizationLearnerIdentity } from '../../domain/models/OrganizationLearnerIdentity.ts';

const USER_TABLE_NAME = 'users';
const VIEW_ORGANIZATION_LEARNERS_TABLE_NAME = 'view-active-organization-learners';

async function getByIds(organizationId, ids) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn({
    viewOrganizationLearners: VIEW_ORGANIZATION_LEARNERS_TABLE_NAME,
  })
    .join({ users: USER_TABLE_NAME }, 'users.id', 'viewOrganizationLearners.userId')
    .select({
      id: 'viewOrganizationLearners.id',
      birthdate: 'viewOrganizationLearners.birthdate',
      division: 'viewOrganizationLearners.division',
      firstName: 'viewOrganizationLearners.firstName',
      lastName: 'viewOrganizationLearners.lastName',
      userId: 'users.id',
      username: 'users.username',
    })
    .whereIn('viewOrganizationLearners.id', ids)
    .where('viewOrganizationLearners.organizationId', organizationId);

  return results.map(_toDomain);
}

function _toDomain(organizationLearnerIdentityDTO) {
  const { id, birthdate, division, firstName, lastName, userId, username } = organizationLearnerIdentityDTO;

  return new OrganizationLearnerIdentity({
    id,
    birthdate,
    division,
    firstName,
    lastName,
    userId,
    username,
  });
}

export const organizationLearnerIdentityRepository = { getByIds };
