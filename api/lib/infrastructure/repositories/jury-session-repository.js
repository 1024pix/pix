const { knex } = require('../bookshelf');
const { fetchPage } = require('../utils/knex-utils');
const { NotFoundError } = require('../../domain/errors');
const JurySession = require('../../domain/models/JurySession');
const { statuses } = require('../../domain/models/JurySession');
const CertificationOfficer = require('../../domain/models/CertificationOfficer');
const { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } = require('../../../db/pgsql-errors');

module.exports = {

  async get(id) {
    const results = await knex
      .select('sessions.*', 'certification-centers.type', 'certification-centers.externalId', 'users.firstName', 'users.lastName')
      .from('sessions')
      .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId')
      .where('sessions.id', '=', id)
      .limit(1);
    if (!results[0]) {
      throw new NotFoundError('La session n\'existe pas ou son accès est restreint');
    }
    return _toDomain(results[0]);
  },

  async findPaginatedFiltered({ filters, page }) {
    const query = knex.from('sessions');

    _setupFilters(query, filters);
    query.orderByRaw('?? ASC NULLS FIRST', 'publishedAt')
      .orderByRaw('?? ASC', 'finalizedAt')
      .orderBy('id')
      .select('sessions.*', 'certification-centers.type', 'certification-centers.externalId', 'users.firstName', 'users.lastName')
      .leftJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .leftJoin('users', 'users.id', 'sessions.assignedCertificationOfficerId');

    const { results, pagination } = await fetchPage(query, page);

    const jurySessions = results.map(_toDomain);

    return {
      jurySessions,
      pagination,
    };
  },

  async assignCertificationOfficer({ id, assignedCertificationOfficerId }) {
    try {
      await knex('sessions')
        .where({ id })
        .update({ assignedCertificationOfficerId })
        .returning('*');
      return this.get(id);
    } catch (error) {
      if (error.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
        throw new NotFoundError(`L'utilisateur d'id ${assignedCertificationOfficerId} n'existe pas`);
      }
      throw new NotFoundError(`La session d'id ${id} n'existe pas.`);
    }
  },
};

function _toDomain(jurySessionFromDB) {
  const jurySession = new JurySession({
    ...jurySessionFromDB,
    certificationCenterName: jurySessionFromDB.certificationCenter,
    certificationCenterType: jurySessionFromDB.type,
    certificationCenterExternalId: jurySessionFromDB.externalId,
  });

  if (jurySessionFromDB.assignedCertificationOfficerId) {
    jurySession.assignedCertificationOfficer = new CertificationOfficer({
      id: jurySessionFromDB.assignedCertificationOfficerId,
      firstName: jurySessionFromDB.firstName,
      lastName: jurySessionFromDB.lastName,
    });
  }

  return jurySession;
}

function _setupFilters(query, filters) {
  const { id, certificationCenterName, status, resultsSentToPrescriberAt, certificationCenterExternalId, certificationCenterType } = filters;

  if (id) {
    query.where('sessions.id', id);
  }

  if (certificationCenterName) {
    query.whereRaw('LOWER("certificationCenter") LIKE ?', `%${certificationCenterName.toLowerCase()}%`);
  }

  if (certificationCenterType) {
    query.where('certification-centers.type', certificationCenterType);
  }

  if (certificationCenterExternalId) {
    query.whereRaw(
      'LOWER(??) LIKE ?', ['certification-centers.externalId', '%' + certificationCenterExternalId.toLowerCase() + '%'],
    );
  }

  if (resultsSentToPrescriberAt === true) {
    query.whereNotNull('resultsSentToPrescriberAt');
  }
  if (resultsSentToPrescriberAt === false) {
    query.whereNull('resultsSentToPrescriberAt');
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
