const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const CertificationCandidateBookshelf = require('../data/certification-candidate');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } = require('../../../db/pgsql-errors');
const {
  NotFoundError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} = require('../../domain/errors');

module.exports = {

  async linkToUser({ id, userId }) {
    try {
      const certificationCandidateBookshelf = new CertificationCandidateBookshelf({ id });
      await certificationCandidateBookshelf.save({ userId }, { patch: true, method: 'update' });
    } catch (bookshelfError) {
      if (bookshelfError.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
        throw new CertificationCandidateMultipleUserLinksWithinSessionError('A user cannot be linked to several certification candidates within the same session');
      }
      throw new CertificationCandidateCreationOrUpdateError('An error occurred while linking the certification candidate to a user');
    }
  },

  async saveInSession({ certificationCandidate, sessionId }) {
    const certificationCandidateDataToSave = _.pick(certificationCandidate,
      ['id', 'firstName', 'lastName', 'birthCity', 'birthProvinceCode',
        'birthCountry', 'email', 'externalId', 'birthdate', 'extraTimePercentage']);

    try {
      const addedCertificationCandidate = await new CertificationCandidateBookshelf({ ...certificationCandidateDataToSave, sessionId }).save();
      return bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, addedCertificationCandidate);
    } catch (bookshelfError) {
      throw new CertificationCandidateCreationOrUpdateError('An error occurred while saving the certification candidate in a session');
    }
  },

  async delete(certificationCandidateId) {
    try {
      await CertificationCandidateBookshelf
        .where({ id: certificationCandidateId })
        .destroy({ require: true });
      return true;
    } catch (err) {
      throw new CertificationCandidateDeletionError('An error occurred while deleting the certification candidate');
    }
  },

  async isNotLinked(certificationCandidateId) {
    const notLinkedCandidate = await CertificationCandidateBookshelf
      .where({ id: certificationCandidateId, userId: null })
      .fetch({ columns: ['id'] });

    return !!notLinkedCandidate;
  },

  getBySessionIdAndUserId({ sessionId, userId }) {
    return CertificationCandidateBookshelf
      .where({ sessionId, userId })
      .fetch({ require: true })
      .then((result) => bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, result))
      .catch((error) => {
        if (error instanceof CertificationCandidateBookshelf.NotFoundError) {
          throw new NotFoundError(`Candidate not found for certification session id ${sessionId} and user id ${userId}`);
        }

        throw error;
      });
  },

  findBySessionId(sessionId) {
    return CertificationCandidateBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("certification-candidates"."lastName") asc');
        qb.orderByRaw('LOWER("certification-candidates"."firstName") asc');
      })
      .fetchAll()
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results));
  },

  findBySessionIdAndPersonalInfo({ sessionId, firstName, lastName, birthdate }) {
    return CertificationCandidateBookshelf
      .query((qb) => {
        qb.where('sessionId', sessionId);
        qb.whereRaw('LOWER(?)=LOWER(??)', [firstName, 'firstName']);
        qb.whereRaw('LOWER(?)=LOWER(??)', [lastName, 'lastName']);
        qb.where('birthdate', birthdate);
      })
      .fetchAll()
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results));
  },

  findOneBySessionIdAndUserId({ sessionId, userId }) {
    return CertificationCandidateBookshelf
      .where({ sessionId, userId })
      .fetchAll()
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results)[0]);
  },

  async setSessionCandidates(sessionId, certificationCandidates) {
    const certificationCandidatesToInsert = certificationCandidates.map(_adaptModelToDb);

    return Bookshelf.knex.transaction(async (trx) => {
      try {
        await trx('certification-candidates')
          .where({ sessionId })
          .del();
      } catch (err) {
        throw new CertificationCandidateDeletionError('An error occurred while deleting the certification candidates during the replacement operation');
      }

      try {
        await trx.batchInsert('certification-candidates', certificationCandidatesToInsert).transacting(trx);
      } catch (err) {
        throw new CertificationCandidateCreationOrUpdateError('An error occurred while inserting the certification candidates during the replacement operation');
      }
    });
  },

  async doesLinkedCertificationCandidateInSessionExist({ sessionId }) {
    const anyLinkedCandidateInSession = await CertificationCandidateBookshelf
      .query({
        where: { sessionId },
        whereNotNull: 'userId',
      }).fetch({ columns: 'id' });

    return anyLinkedCandidateInSession !== null;
  },

};

function _adaptModelToDb(certificationCandidateToSave) {
  return _.omit(certificationCandidateToSave, ['createdAt', 'certificationCourse']);
}
