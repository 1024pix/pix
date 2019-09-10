const CertificationCandidateBookshelf = require('../data/certification-candidate');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { CertificationCandidateCreationOrUpdateError, CertificationCandidateDeletionError } = require('../../domain/errors');
const _ = require('lodash');
const Bookshelf = require('../bookshelf');

module.exports = {

  save(certificationCandidateToSave) {
    const certificationCandidateBookshelf = new CertificationCandidateBookshelf(_.omit(certificationCandidateToSave, ['createdAt']));
    return certificationCandidateBookshelf.save()
      .then((savedCertificationCandidate) => bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, savedCertificationCandidate))
      .catch((error) => {
        throw new CertificationCandidateCreationOrUpdateError(error);
      });
  },

  delete(certificationCandidateId) {
    return CertificationCandidateBookshelf
      .where({ id: certificationCandidateId })
      .destroy({ require: true })
      .then((destroyedCertificationCandidate) => {
        return bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, destroyedCertificationCandidate);
      })
      .catch((error) => {
        throw new CertificationCandidateDeletionError(error);
      });
  },

  findBySessionId(sessionId) {
    return CertificationCandidateBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("certification-candidates"."lastName") asc');
        qb.orderByRaw('LOWER("certification-candidates"."firstName") asc');
      })
      .fetchAll({})
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results));
  },

  async replaceBySessionId(sessionId, certificationCandidates) {
    const certificationCandidatesToInsert = certificationCandidates.map((candidate) => _.omit(candidate, ['createdAt']));

    return Bookshelf.knex.transaction(async (trx) => {
      try {
        await trx('certification-candidates')
          .where({ sessionId })
          .del();
      } catch (err) {
        throw new CertificationCandidateDeletionError(err);
      }

      try {
        await trx.batchInsert('certification-candidates', certificationCandidatesToInsert).transacting(trx);
      } catch (err) {
        throw new CertificationCandidateCreationOrUpdateError(err);
      }
    });
  }
};
