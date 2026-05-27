import { AdminMember } from '../../../team/domain/models/AdminMember.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

/*
 * TODO(shared): this repository MUST be removed from shared context.
 * Will be removed when usecases `checkAdminMemberHasRoleXXX` replaced by API from `team` context.
 */
const TABLE_NAME = 'pix-admin-roles';

const get = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const adminMember = await knexConn
    .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role', 'disabledAt')
    .from(TABLE_NAME)
    .where({ userId })
    .join('users', 'users.id', `${TABLE_NAME}.userId`)
    .first();

  return adminMember ? new AdminMember(adminMember) : undefined;
};

export const adminMemberRepository = { get };
