const { expect, sinon, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');

describe('Unit | UseCase | get-student-linked-to-user', () => {

  const userId = 1;
  let studentReceivedStub;
  let student;
  const organizationId = 1;

  beforeEach(() => {
    student = domainBuilder.buildStudent({ organizationId, userId });

    studentReceivedStub = sinon.stub(studentRepository, 'getByUserId');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('There is a student linked to the given userId', () => {

    it('should call getByUserId in student repositories', async () => {
      // given
      studentReceivedStub.resolves({});

      // when
      await usecases.getStudentLinkedToUser({ userId });

      // then
      expect(studentReceivedStub).have.been.calledOnce;
    });

    it('should return the student', async () => {
      // given
      studentReceivedStub.withArgs({ userId }).resolves(student);
      
      // when
      const result = await usecases.getStudentLinkedToUser({ userId });

      // then
      expect(result).to.be.deep.equal(student);
      expect(result).to.be.instanceof(Student);
    });
  });

  describe('There is no student linked to the given userId', () => {

    it('should return the repositories error', async () => {
      // given
      studentReceivedStub.withArgs({ userId }).resolves(null);

      // when
      const result = await usecases.getStudentLinkedToUser({ userId });

      // then
      expect(result).to.to.equal(null);
    });
  });
});
