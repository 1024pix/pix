const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');

const updateStudentNumber = require('../../../../lib/domain/usecases/update-student-number');

describe('Unit | UseCase | update-student-number', function () {
  const organizationId = 2;
  const studentNumber = '4321A';
  const schoolingRegistrationId = 1234;

  let schoolingRegistration;

  const higherSchoolingRegistrationRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    findOneByStudentNumber: sinon.stub(),
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    updateStudentNumber: sinon.stub(),
  };

  context('When there is a schooling registration with the same student number', function () {
    beforeEach(function () {
      schoolingRegistration = domainBuilder.buildHigherSchoolingRegistration();

      higherSchoolingRegistrationRepository.findOneByStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves(schoolingRegistration);
    });

    it('should throw an AlreadyExistingEntityError', async function () {
      // given
      const errorMessage = 'STUDENT_NUMBER_EXISTS';

      // when
      const error = await catchErr(updateStudentNumber)({
        higherSchoolingRegistrationRepository,
        schoolingRegistrationId,
        studentNumber,
        organizationId,
      });

      // then
      expect(error).to.be.an.instanceOf(AlreadyExistingEntityError);
      expect(error.message).to.equal(errorMessage);
    });
  });

  context('When there are not schooling registration with the same student number', function () {
    beforeEach(function () {
      higherSchoolingRegistrationRepository.findOneByStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves(null);
    });

    it('should update a student number', async function () {
      // when
      await updateStudentNumber({
        higherSchoolingRegistrationRepository,
        schoolingRegistrationId,
        studentNumber,
        organizationId,
      });

      // then
      expect(higherSchoolingRegistrationRepository.updateStudentNumber).to.have.been.calledWith(
        schoolingRegistrationId,
        studentNumber
      );
    });
  });
});
