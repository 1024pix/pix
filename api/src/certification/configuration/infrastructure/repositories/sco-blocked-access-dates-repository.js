// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { ScoBlockedAccessDate } from '../../domain/models/ScoBlockedAccessDate.js';

/**
 * @returns {Promise<Array<ScoBlockedAccessDate>>}
 */
export async function getScoBlockedAccessDates() {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification_sco_blocked_access_dates').select(
    'scoOrganizationTagName',
    'reopeningDate',
  );
  if (data.length > 0) {
    return data.map(_toDomain);
  } else {
    throw new NotFoundError(`No ScoBlockedAccessDate found.`);
  }
}

/**
 * @returns {Promise<ScoBlockedAccessDate>}
 * @throws {NotFoundError} if ScoBlockedAccessDate does not exist
 */
export async function getScoBlockedAccessDateByKey(scoOrganizationTagName) {
  const knexConn = DomainTransaction.getConnection();
  const data = await knexConn('certification_sco_blocked_access_dates')
    .select('scoOrganizationTagName', 'reopeningDate')
    .where({ scoOrganizationTagName })
    .first();
  if (data) {
    return _toDomain(data);
  } else {
    throw new NotFoundError(`ScoBlockedAccessDate ${scoOrganizationTagName} does not exist.`);
  }
}

/**
 * @param {object} params
 * @param {ScoBlockedAccessDate} params.scoBlockedAccessDate
 */
export async function updateScoBlockedAccessDate(scoBlockedAccessDate) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification_sco_blocked_access_dates')
    .update({ reopeningDate: scoBlockedAccessDate.reopeningDate })
    .where({ scoOrganizationTagName: scoBlockedAccessDate.scoOrganizationTagName });
}

function _toDomain({ scoOrganizationTagName, reopeningDate }) {
  return new ScoBlockedAccessDate({ scoOrganizationTagName, reopeningDate });
}
