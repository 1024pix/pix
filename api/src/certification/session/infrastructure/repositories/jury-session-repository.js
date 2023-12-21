import { knex } from '../../../../../db/knex-database-connection.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { JurySession, statuses } from '../../../../../lib/domain/models/JurySession.js';
import { CertificationOfficer } from '../../domain/models/CertificationOfficer.js';
import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../../db/pgsql-errors.js';

const COLUMNS = Object.freeze([
  'sessions.*',
  'certification-centers.type',
  'certification-centers.externalId',
  'users.firstName',
  'users.lastName',
]);
const ALIASED_COLUMNS = Object.freeze({
  juryCommentAuthorFirstName: 'jury-comment-authors.firstName',
  juryCommentAuthorLastName: 'jury-comment-authors.lastName',
});

const get = async function (id) {
  const jurySessionDTO = await knex
    .select(COLUMNS)
    .select(ALIASED_COLUMNS)
    .from('sessions')
    .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId')
    .leftJoin({ 'jury-comment-authors': 'users' }, 'jury-comment-authors.id', 'sessions.juryCommentAuthorId')
    .where('sessions.id', '=', id)
    .first();
  if (!jurySessionDTO) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return _toDomain(jurySessionDTO);
};

const findPaginatedFiltered = async function ({ filters, page }) {
  const query = knex
    .select(COLUMNS)
    .select(ALIASED_COLUMNS)
    .from('sessions')
    .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId')
    .leftJoin({ 'jury-comment-authors': 'users' }, 'jury-comment-authors.id', 'sessions.juryCommentAuthorId')
    .modify(_setupFilters, filters)
    .orderByRaw('?? ASC NULLS FIRST', 'publishedAt')
    .orderByRaw('?? ASC', 'finalizedAt')
    .orderBy('id');

  const { results, pagination } = await fetchPage(query, page);
  const jurySessions = results.map(_toDomain);

  return {
    jurySessions,
    pagination,
  };
};

const assignCertificationOfficer = async function ({ id, assignedCertificationOfficerId }) {
  try {
    await knex('sessions').where({ id }).update({ assignedCertificationOfficerId }).returning('*');
    return this.get(id);
  } catch (error) {
    if (error.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
      throw new NotFoundError(`L'utilisateur d'id ${assignedCertificationOfficerId} n'existe pas`);
    }
    throw new NotFoundError(`La session d'id ${id} n'existe pas.`);
  }
};

export { get, findPaginatedFiltered, assignCertificationOfficer };

function _toDomain(jurySessionFromDB) {
  let assignedCertificationOfficer = null;
  if (jurySessionFromDB.assignedCertificationOfficerId) {
    assignedCertificationOfficer = new CertificationOfficer({
      id: jurySessionFromDB.assignedCertificationOfficerId,
      firstName: jurySessionFromDB.firstName,
      lastName: jurySessionFromDB.lastName,
    });
  }

  let juryCommentAuthor = null;
  if (jurySessionFromDB.juryCommentAuthorId) {
    juryCommentAuthor = new CertificationOfficer({
      id: jurySessionFromDB.juryCommentAuthorId,
      firstName: jurySessionFromDB.juryCommentAuthorFirstName,
      lastName: jurySessionFromDB.juryCommentAuthorLastName,
    });
  }

  const jurySession = new JurySession({
    ...jurySessionFromDB,
    certificationCenterName: jurySessionFromDB.certificationCenter,
    certificationCenterType: jurySessionFromDB.type,
    certificationCenterExternalId: jurySessionFromDB.externalId,
    assignedCertificationOfficer,
    juryCommentAuthor,
  });

  return jurySession;
}

function _setupFilters(query, filters) {
  const { id, certificationCenterName, status, certificationCenterExternalId, certificationCenterType, version } =
    filters;

  if (id) {
    query.where('sessions.id', id);
  }

  if (certificationCenterName) {
    query.whereILike('certificationCenter', `%${certificationCenterName}%`);
  }

  if (certificationCenterType) {
    query.where('certification-centers.type', certificationCenterType);
  }

  if (certificationCenterExternalId) {
    query.whereRaw('LOWER(??) LIKE ?', [
      'certification-centers.externalId',
      '%' + certificationCenterExternalId.toLowerCase() + '%',
    ]);
  }

  if (version) {
    query.where('sessions.version', version);
  }

  if (status === statuses.CREATED) {
    query.whereNull('finalizedAt');
    query.whereNull('publishedAt');
  }
  if (status === statuses.FINALIZED) {
    query.whereNotNull('finalizedAt');
    query.whereNull('assignedCertificationOfficerId');
    query.whereNull('publishedAt');
  }
  if (status === statuses.IN_PROCESS) {
    query.whereNotNull('finalizedAt');
    query.whereNotNull('assignedCertificationOfficerId');
    query.whereNull('publishedAt');
  }
  if (status === statuses.PROCESSED) {
    query.whereNotNull('publishedAt');
  }
}
