const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | link-user-to-organization-student-data', () => {

  let associateUserAndStudentStub;
  let campaignCode;
  let findStudentStub;
  let findMatchingCandidateIdForGivenUserStub;
  let student;
  let user;
  const organizationId = 1;
  const studentId = 1;

  afterEach(() => {
    sinon.restore();
  });

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

    findStudentStub = sinon.stub(studentRepository, 'findNotLinkedYetByOrganizationIdAndUserBirthdate')
      .withArgs({
        organizationId,
        birthdate: user.birthdate
      }).resolves([student]);

    associateUserAndStudentStub = sinon.stub(studentRepository, 'associateUserAndStudent');
  });

  context('When no student found based on birthdate and organizationId', () => {

    it('should throw a Not Found error', async () => {
      // given
      findStudentStub.resolves([]);

      // when
      const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('There were not exactly one student match for this user and organization');
    });
  });

  context('When at least one student found based on birthdate and organizationId', () => {

    beforeEach(() => {
      findMatchingCandidateIdForGivenUserStub = sinon.stub(userReconciliationService,'findMatchingCandidateIdForGivenUser');
    });

    context('When no student matched on names', () => {

      it('should throw a Not Found error', async () => {
        // given
        user.firstName = 'Sam';

        student.firstName = 'Joe';
        student.lastName = user.lastName;
        findMatchingCandidateIdForGivenUserStub.withArgs([student], user).returns(null);

        // when
        const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
          user,
          campaignCode,
        });

        // then
        expect(result).to.be.instanceof(NotFoundError);
        expect(result.message).to.equal('There were not exactly one student match for this user and organization');
      });
    });

    context('When one student matched on names', () => {

      it('should associate user with student', async () => {
        // given
        student.userId = user.id;
        student.firstName = user.firstName;
        student.lastName = user.lastName;
        findMatchingCandidateIdForGivenUserStub.withArgs([student], { firstName: user.firstName, lastName: user.lastName }).returns(studentId);
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
    });
  });
});
