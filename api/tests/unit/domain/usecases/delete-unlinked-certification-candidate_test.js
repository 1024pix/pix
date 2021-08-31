const {
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const deleteUnlinkedCertificationCandidate = require('../../../../lib/domain/usecases/delete-unlinked-certification-candidate');
const { CertificationCandidateForbiddenDeletionError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | delete-unlinked-sertification-candidate', function() {

  let certificationCandidateId;
  let certificationCandidateRepository;

  beforeEach(function() {
    certificationCandidateId = 'dummy certification candidate id';
    certificationCandidateRepository = {
      isNotLinked: sinon.stub(),
      delete: sinon.stub(),
    };
  });

  context('When the certification candidate is not linked to a user', function() {

    beforeEach(function() {
      certificationCandidateRepository.isNotLinked.withArgs(certificationCandidateId).resolves(true);
      certificationCandidateRepository.delete.withArgs(certificationCandidateId).resolves(true);
    });

    it('should delete the certification candidate', async function() {
      // when
      const res = await deleteUnlinkedCertificationCandidate({
        certificationCandidateId,
        certificationCandidateRepository,
      });

      // then
      expect(res).to.deep.equal(true);
    });

  });

  context('When the certification candidate is linked to a user ', function() {

    beforeEach(function() {
      certificationCandidateRepository.isNotLinked.withArgs(certificationCandidateId).resolves(false);
    });

    it('should throw a forbidden deletion error', async function() {
      // when
      const err = await catchErr(deleteUnlinkedCertificationCandidate)({
        certificationCandidateId,
        certificationCandidateRepository,
      });

      // then
      expect(err).to.be.instanceOf(CertificationCandidateForbiddenDeletionError);
    });

  });

});
