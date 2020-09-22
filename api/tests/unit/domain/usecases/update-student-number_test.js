const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const updateStudentNumber = require('../../../../lib/domain/usecases/update-student-number');
const { AlreadyExistingEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-student-number', () => {
  const organizationId = 2;
  const studentNumber = '4321A';
  const schoolingRegistrationId = 1234;

  let schoolingRegistration;

  const schoolingRegistrationRepository = {
    findByOrganizationIdAndStudentNumber: sinon.stub(),
    updateStudentNumber: sinon.stub(),
  };

  context('When there is a schooling registration with the same student number', () => {
    beforeEach(() => {
      schoolingRegistration = domainBuilder.buildSchoolingRegistration();

      schoolingRegistrationRepository.findByOrganizationIdAndStudentNumber
        .withArgs({ organizationId, studentNumber })
        .resolves([schoolingRegistration]);
    });
    it('should return an error', async () => {
      // when
      const error = await catchErr(updateStudentNumber)({ schoolingRegistrationRepository, schoolingRegistrationId, studentNumber, organizationId });
      const errorMessage = `Le numéro étudiant saisi est déjà utilisé par l’étudiant ${schoolingRegistration.firstName} ${schoolingRegistration.lastName}.`;

      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntity);
      expect(error.message).to.equal(errorMessage);
    });
  });

  context('When there are not schooling registration with the same student number', () => {
    beforeEach(() => {
      schoolingRegistrationRepository.findByOrganizationIdAndStudentNumber.withArgs({ organizationId, studentNumber }).resolves([]);
    });
    it('should update a student number', async () => {
      // when
      await updateStudentNumber({ schoolingRegistrationRepository, schoolingRegistrationId, studentNumber, organizationId });

      // then
      expect(schoolingRegistrationRepository.updateStudentNumber).to.have.been.calledWith(schoolingRegistrationId, studentNumber);
    });
  });
});
