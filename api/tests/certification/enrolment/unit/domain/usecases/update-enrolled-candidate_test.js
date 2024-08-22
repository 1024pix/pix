import { updateEnrolledCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/update-enrolled-candidate.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-enrolled-candidate', function () {
  let enrolledCandidateRepository;
  let editedCandidate;
  let createdAt;

  beforeEach(function () {
    enrolledCandidateRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    createdAt = new Date();
    editedCandidate = domainBuilder.certification.enrolment.buildEditedCandidate({
      id: 123,
      accessibilityAdjustmentNeeded: true,
    });
  });

  context('when the candidate is found', function () {
    it('should call update method with correct data', async function () {
      // given
      const foundedCandidate = domainBuilder.certification.enrolment.buildEnrolledCandidate({
        id: editedCandidate.id,
        accessibilityAdjustmentNeeded: false,
        createdAt,
      });
      enrolledCandidateRepository.get.withArgs({ id: editedCandidate.id }).resolves(foundedCandidate);
      enrolledCandidateRepository.update.resolves();

      // when
      await updateEnrolledCandidate({
        editedCandidate,
        enrolledCandidateRepository,
      });

      // then
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...foundedCandidate,
        accessibilityAdjustmentNeeded: editedCandidate.accessibilityAdjustmentNeeded,
      });

      expect(enrolledCandidateRepository.update).to.have.been.calledOnceWithExactly({
        candidate,
      });
    });
  });

  context('when the candidate is not found', function () {
    it('should throw a CertificationCandidateNotFoundError', async function () {
      // given
      enrolledCandidateRepository.get.withArgs({ id: 123 }).resolves(null);

      // when
      const error = await catchErr(updateEnrolledCandidate)({
        editedCandidate,
        enrolledCandidateRepository,
      });

      // then
      expect(error).to.be.instanceOf(CertificationCandidateNotFoundError);
    });
  });
});
