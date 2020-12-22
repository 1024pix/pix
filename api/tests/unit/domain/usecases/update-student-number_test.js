const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');

const updateStudentNumber = require('../../../../lib/domain/usecases/update-student-number');

describe('Unit | UseCase | update-student-number', () => {

  const organizationId = 2;
  const studentNumber = '4321A';
  const schoolingRegistrationId = 1234;

  let schoolingRegistration;

  const higherSchoolingRegistrationRepository = {
    findByOrganizationIdAndStudentNumber: sinon.stub(),
    updateStudentNumber: sinon.stub(),
  };

  context('When there is a schooling registration with the same student number', () => {

    beforeEach(() => {
      schoolingRegistration = domainBuilder.buildHigherSchoolingRegistration();

      higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves([schoolingRegistration]);
    });

    it('should throw an AlreadyExistingEntityError', async () => {
      // given
      const errorMessage = `Le numéro étudiant saisi est déjà utilisé par l’étudiant ${schoolingRegistration.firstName} ${schoolingRegistration.lastName}.`;

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

  context('When there are not schooling registration with the same student number', () => {

    beforeEach(() => {
      higherSchoolingRegistrationRepository.findByOrganizationIdAndStudentNumber.withArgs({ organizationId, studentNumber }).resolves([]);
    });

    it('should update a student number', async () => {
      // when
      await updateStudentNumber({
        higherSchoolingRegistrationRepository,
        schoolingRegistrationId,
        studentNumber,
        organizationId,
      });

      // then
      expect(higherSchoolingRegistrationRepository.updateStudentNumber).to.have.been.calledWith(schoolingRegistrationId, studentNumber);
    });
  });
});
