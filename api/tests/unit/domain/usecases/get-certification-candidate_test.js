const { expect, sinon } = require('../../../test-helper');
const getCertificationCandidate = require('../../../../lib/domain/usecases/get-certification-candidate');

describe('Unit | UseCase | get-certification-candidate', () => {

  let certificationCandidate;
  let certificationCandidateRepository;

  beforeEach(() => {
    certificationCandidate = {
      id: 1,
    };
    certificationCandidateRepository = {
      get: sinon.stub(),
      checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate: sinon.stub(),
    };
  });

  context('User has no access to certification candidate', () => {

    it('should throw an error', () => {
      // given
      const userId = 123;
      certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate.withArgs(
        certificationCandidate.id,
        userId
      ).rejects();

      // when
      const promise = getCertificationCandidate(
        {
          certificationCandidateId: certificationCandidate.id,
          userId,
          certificationCandidateRepository
        });

      // then
      return expect(promise).to.be.rejected;
    });

  });

  context('User has access to certification candidate', () => {

    const userId = 123;
    beforeEach(() => {
      certificationCandidateRepository.checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate.withArgs(
        certificationCandidate.id,
        userId
      ).returns(true);
    });

    it('should get the certificationCandidate', async () => {
      // given
      certificationCandidateRepository.get.withArgs(certificationCandidate.id).resolves(certificationCandidate);

      // when
      const retrievedCertificationCandidate = await getCertificationCandidate(
        {
          certificationCandidateId: certificationCandidate.id,
          userId,
          certificationCandidateRepository
        });

      // then
      expect(retrievedCertificationCandidate).to.deep.equal(certificationCandidate);
    });

    it('should throw an error when the certification candidate could not be retrieved', () => {
      // given
      certificationCandidateRepository.get.withArgs(certificationCandidate.id).rejects();

      // when
      const promise = getCertificationCandidate(
        {
          certificationCandidateId: certificationCandidate.id,
          userId,
          certificationCandidateRepository
        });

      // then
      return expect(promise).to.be.rejected;
    });
  });

});
