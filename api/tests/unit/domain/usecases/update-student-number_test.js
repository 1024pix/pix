const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const updateStudentNumber = require('../../../../lib/domain/usecases/update-student-number');
const { AlreadyExistingEntity } = require('../../../../lib/domain/errors');
describe('Unit | UseCase | update-student-number', () => {
  const organizationId = 2;
  const student = {
    id: 1234,
    studentNumber: 4321,
  };

  let schoolingRegistration;

  const schoolingRegistrationRepository = {
    findOneByOrganizationIdAndStudentNumber: sinon.stub(),
    updateStudentNumber: sinon.stub(),
  };

  context('When there are a schooling registration with a same student number', () => {
    beforeEach(() => {
      schoolingRegistration = domainBuilder.buildSchoolingRegistration();

      schoolingRegistrationRepository.findOneByOrganizationIdAndStudentNumber
        .withArgs(organizationId, student.studentNumber)
        .resolves([schoolingRegistration]);
    });
    it('should return an error', async () => {
      // when 
      const error = await catchErr(updateStudentNumber)({ schoolingRegistrationRepository, student, organizationId });
      const errorMessage = `Le numéro étudiant saisi est déjà utilisé par l’étudiant ${schoolingRegistration.firstName} ${schoolingRegistration.lastName}.`;
        
      // then
      expect(error).to.be.instanceOf(AlreadyExistingEntity);
      expect(error.message).to.equal(errorMessage);
    
    });
  });
  
  context('When there are not schooling registration with the same student number', () => {
    beforeEach(() => {
      schoolingRegistrationRepository.findOneByOrganizationIdAndStudentNumber.withArgs(organizationId,student.studentNumber).resolves([]);
    });
    it('should update a student number', async () => {
      // when
      await updateStudentNumber({ schoolingRegistrationRepository, student, organizationId });
        
      // then
      expect(schoolingRegistrationRepository.updateStudentNumber).to.have.been.calledWith(student.id, student.studentNumber);
      
    });
  });
  
});
