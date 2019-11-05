const CertificationCandidateBookshelf = require('../data/certification-candidate');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const {
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} = require('../../domain/errors');
const _ = require('lodash');
const Bookshelf = require('../bookshelf');
const { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } = require('../../../db/pgsql-errors');

module.exports = {

  save(certificationCandidateToSave) {
    const certificationCandidateBookshelf = new CertificationCandidateBookshelf(_.omit(certificationCandidateToSave, ['createdAt']));
    return certificationCandidateBookshelf.save()
      .then((savedCertificationCandidate) => bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, savedCertificationCandidate))
      .catch((bookshelfError) => {
        if (bookshelfError.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
          throw new CertificationCandidateMultipleUserLinksWithinSessionError('A user cannot be linked to several certification candidates within the same session');
        }
        throw new CertificationCandidateCreationOrUpdateError('An error occurred while saving the certification candidate');
      });
  },

  delete(certificationCandidateId) {
    return CertificationCandidateBookshelf
      .where({ id: certificationCandidateId })
      .destroy({ require: true })
      .then((destroyedCertificationCandidate) => {
        return bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, destroyedCertificationCandidate);
      })
      .catch(() => {
        throw new CertificationCandidateDeletionError('An error occurred while deleting the certification candidate');
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
    const certificationCandidatesToInsert = certificationCandidates.map((candidate) => _.omit(candidate, ['createdAt']));

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
  }
};
