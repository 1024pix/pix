const { expect, sinon, domainBuilder } = require('../../../test-helper');
const deleteCertificationCandidate = require('../../../../lib/domain/usecases/delete-certification-candidate');
const { UserNotAuthorizedToAccessEntity, CertificationCandidateDeletionError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Unit | UseCase | delete-certification-candidate', () => {

  let result;
  const userId = 123;
  const certificationCandidateRepository = {
    delete: _.noop,
    checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate: _.noop,
    checkIfCertificationCandidateIsSafeForDeletion: _.noop
  };
  const certificationCandidateId = domainBuilder.buildCertificationCandidate().id;
  const deletedCertificationCandidate = domainBuilder.buildCertificationCandidate();
  _.each(deletedCertificationCandidate, (value, key) => {
    deletedCertificationCandidate[key] = undefined;
  });

  context('user certification center membership does not provide access to the certification candidate', () => {
    beforeEach(() => {
      // given
      sinon.stub(certificationCandidateRepository, 'checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate').rejects();
    });

    it('should return an error when user does not have access to the certification candidate', async () => {
      // when
      try {
        result = await deleteCertificationCandidate({
          userId,
          certificationCandidateRepository,
          certificationCandidateId: certificationCandidateId,
        });
      } catch (err) {
        result = err;
      }
      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });

  });

  context('user has access to the certification candidate', () => {

    context('certification candidate is not safe to delete', () => {

      beforeEach(() => {
        // given
        sinon.stub(certificationCandidateRepository, 'checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate').resolves();
        sinon.stub(certificationCandidateRepository, 'checkIfCertificationCandidateIsSafeForDeletion').rejects(new CertificationCandidateDeletionError());
      });

      it('should return an error when the certification candidate is not safe to delete', async () => {
        // when
        try {
          result = await deleteCertificationCandidate({
            userId,
            certificationCandidateRepository,
            certificationCandidateId: certificationCandidateId,
          });
        } catch (err) {
          result = err;
        }
        // then
        expect(result).to.be.instanceOf(CertificationCandidateDeletionError);
      });

    });

    context('certification candidate is safe to delete', () => {

      beforeEach(() => {
        // given
        sinon.stub(certificationCandidateRepository, 'delete').resolves(deletedCertificationCandidate);
        sinon.stub(certificationCandidateRepository, 'checkIfUserCertificationCenterMembershipHasAccessToCertificationCandidate').resolves();
        sinon.stub(certificationCandidateRepository, 'checkIfCertificationCandidateIsSafeForDeletion').resolves();
      });

      it('should delete the certification candidate', async () => {
        // when
        const actuallyDeletedCertificationCandidate = await deleteCertificationCandidate({
          userId,
          certificationCandidateRepository,
          certificationCandidateId: certificationCandidateId,
        });

        // then
        expect(certificationCandidateRepository.delete).to.have.been.called;
        expect(actuallyDeletedCertificationCandidate).to.deep.equal(deletedCertificationCandidate);

      });
    });

  });

});
