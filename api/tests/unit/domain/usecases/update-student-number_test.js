import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { AlreadyExistingEntityError } from '../../../../lib/domain/errors';
import updateStudentNumber from '../../../../lib/domain/usecases/update-student-number';

describe('Unit | UseCase | update-student-number', function () {
  const organizationId = 2;
  const studentNumber = '4321A';
  const organizationLearnerId = 1234;

  let organizationLearner;

  const supOrganizationLearnerRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    findOneByStudentNumber: sinon.stub(),
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    updateStudentNumber: sinon.stub(),
  };

  context('When there is an organization learner with the same student number', function () {
    beforeEach(function () {
      organizationLearner = domainBuilder.buildSupOrganizationLearner();

      supOrganizationLearnerRepository.findOneByStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves(organizationLearner);
    });

    it('should throw an AlreadyExistingEntityError', async function () {
      // given
      const errorMessage = 'STUDENT_NUMBER_EXISTS';

      // when
      const error = await catchErr(updateStudentNumber)({
        supOrganizationLearnerRepository,
        organizationLearnerId,
        studentNumber,
        organizationId,
      });

      // then
      expect(error).to.be.an.instanceOf(AlreadyExistingEntityError);
      expect(error.message).to.equal(errorMessage);
    });
  });

  context('When there are not organization learner with the same student number', function () {
    beforeEach(function () {
      supOrganizationLearnerRepository.findOneByStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves(null);
    });

    it('should update a student number', async function () {
      // when
      await updateStudentNumber({
        supOrganizationLearnerRepository,
        organizationLearnerId,
        studentNumber,
        organizationId,
      });

      // then
      expect(supOrganizationLearnerRepository.updateStudentNumber).to.have.been.calledWith(
        organizationLearnerId,
        studentNumber
      );
    });
  });
});
