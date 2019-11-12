const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | link-user-to-organization-student-data', () => {

  let associateUserAndStudentStub;
  let campaignCode;
  let findStudentStub;
  let findMatchingPretenderIdForGivenUserStub;
  let student;
  let students;
  let user;
  const organizationId = 1;
  const studentId = 1;

  afterEach(() => {
    sinon.restore();
  });

  context('When user is not connected', () => {

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

  context('When user is connected', () => {

    beforeEach(() => {
      campaignCode = 'ABCD12';
      students = [
        domainBuilder.buildStudent({ organizationId }),
        domainBuilder.buildStudent({ organizationId }),
      ];
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
        }).resolves(students);

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
        expect(result.message).to.equal('Not found only 1 student');
      });
    });

    context('When at least one student found based on birthdate and organizationId', () => {

      beforeEach(() => {
        findMatchingPretenderIdForGivenUserStub = sinon.stub(userReconciliationService,'findMatchingPretenderIdForGivenUser');
      });

      context('When no student matched on names', () => {

        it('should throw a Not Found error if no student matched', async () => {
          // given
          user.firstName = 'Sam';

          students[0].firstName = 'Joe';
          students[0].lastName = user.lastName;
          associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);
          findMatchingPretenderIdForGivenUserStub.withArgs(students, user).returns(null);

          // when
          const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
            user,
            campaignCode,
          });

          // then
          expect(result).to.be.instanceof(NotFoundError);
          expect(result.message).to.equal('Not found only 1 student');
        });
      });

      context('When one student matched on names', () => {

        it('should associate user with student', async () => {
          // given
          students[0].userId = user.id;
          students[0].firstName = user.firstName;
          students[0].lastName = user.lastName;
          associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);
          findMatchingPretenderIdForGivenUserStub.withArgs(students, user).returns(students[0].id);

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
});
