const CertificationCandidateBookshelf = require('../data/certification-candidate');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { CertificationCandidateCreationOrUpdateError, CertificationCandidateDeletionError, NotFoundError } = require('../../domain/errors');
const _ = require('lodash');

module.exports = {

  get(certificationCandidateId) {
    return CertificationCandidateBookshelf
      .where({ id: certificationCandidateId })
      .fetch({ require: true })
      .then((certificationCandidate) => bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, certificationCandidate))
      .catch((error) => {
        if (error instanceof CertificationCandidateBookshelf.NotFoundError) {
          return Promise.reject(new NotFoundError());
        }
        return Promise.reject(error);
      });
  },

  save(certificationCandidateToSave) {
    const certificationCandidateData = _adaptModelToDb(certificationCandidateToSave);
    const certificationCandidateBookshelf = new CertificationCandidateBookshelf(certificationCandidateData);
    return certificationCandidateBookshelf.save()
      .then((savedCertificationCandidate) => bookshelfToDomainConverter.buildDomainObject(CertificationCandidateBookshelf, savedCertificationCandidate))
      .catch((error) => {
        throw new CertificationCandidateCreationOrUpdateError(error);
      });
  },

  findBySessionId(sessionId) {
    return CertificationCandidateBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderBy('lastName', 'asc');
        qb.orderBy('firstName', 'asc');
      })
      .fetchAll({})
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(CertificationCandidateBookshelf, results));
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

  checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate(certificationCandidateId, userId) {
    return CertificationCandidateBookshelf
      .query((qb) => {
        qb.where({ 'certification-candidates.id': certificationCandidateId, 'certification-center-memberships.userId': userId });
        qb.innerJoin('sessions', 'sessions.id', 'certification-candidates.sessionId');
        qb.innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId');
        qb.innerJoin('certification-center-memberships', 'certification-center-memberships.certificationCenterId', 'certification-centers.id');
      })
      .fetch({
        require: true,
      })
      .then(() => Promise.resolve(true))
      .catch(() => Promise.resolve(false));
  },

  checkIfCertificationCandidateIsSafeForDeletion(certificationCandidateId) {
    return CertificationCandidateBookshelf
      .query((qb) => {
        qb.where({ 'certification-candidates.id': certificationCandidateId });
        qb.where('sessions.date', '<', 'NOW() - INTERVAL 1 DAY');
        qb.innerJoin('sessions', 'sessions.id', 'certification-candidates.sessionId');
      })
      .fetch({
        require: true,
      })
      .then(() => Promise.resolve(true))
      .catch((error) => {
        throw new CertificationCandidateDeletionError(error);
      });
  },
};

function _adaptModelToDb(certificationCandidate) {
  return _.omit(certificationCandidate, [
    'createdAt',
  ]);
}
