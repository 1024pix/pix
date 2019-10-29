const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | link-user-to-organization-student-data', () => {

  let associateUserAndStudentStub;
  let campaignCode;
  let findStudentStub;
  let student;
  let user;
  const organizationId = 1;
  const studentId = 1;

  beforeEach(() => {
    campaignCode = 'ABCD12';
    student = domainBuilder.buildStudent({ organizationId, id: studentId });
    user = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '02/02/1992',
    };

    sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    findStudentStub = sinon.stub(studentRepository, 'findByOrganizationIdAndUserFirstNameLastName')
      .withArgs({
        organizationId,
        firstName: user.firstName,
        lastName: user.lastName
      }).resolves([student]);

    associateUserAndStudentStub = sinon.stub(studentRepository, 'associateUserAndStudent');
  });

  afterEach(() => {
    sinon.restore();
  });

  context('User is not connected', () => {
    it('should throw an error', async () => {
      // given
      user.id = null;

      // when
      try {
        await usecases.linkUserToOrganizationStudentData({
          user,
          campaignCode,
        });
        throw new Error('expected error');
      } catch (err) {
        // then
        expect(err).to.be.instanceof(UserNotAuthorizedToAccessEntity);
      }
    });
  });

  context('User is connected', () => {

    it('should check if user is part of the student list and associate user and matching organization student', async () => {
      // given
      student.userId  = user.id;
      associateUserAndStudentStub.withArgs({ userId: user.id, studentId }).resolves(student);

      // when
      await usecases.linkUserToOrganizationStudentData({
        user,
        campaignCode,
      });

      // then
      expect(findStudentStub).have.been.calledOnce;
      expect(associateUserAndStudentStub).have.been.calledOnce;
    });

    it('should resolve if student was patched', async () => {
      // given
      student.userId  = user.id;
      associateUserAndStudentStub.withArgs({ userId: user.id, studentId }).resolves(student);

      // when
      const result = await usecases.linkUserToOrganizationStudentData({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(Student);
      expect(result.userId).to.be.equal(user.id);
    });

    it('should throw an 401 error, when we don’t find student to associate in organization list', async () => {
      // given
      findStudentStub.rejects(new NotFoundError('test error'));

      // when
      const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('test error');
    });
  });
});
