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

      context('When no student matched on names', () => {

        it('should throw a Not Found error if name is completely different', async () => {
          // given
          user.firstName = 'Sam';

          students[0].firstName = 'Joe';
          students[0].lastName = user.lastName;
          associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

          // when
          const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
            user,
            campaignCode,
          });

          // then
          expect(result).to.be.instanceof(NotFoundError);
          expect(result.message).to.equal('Not found only 1 student');
        });

        it('should throw a Not Found error if firstName is a nickname', async () => {
          // given
          user.firstName = 'Mathieu';

          students[0].firstName = 'Math';
          students[0].lastName = user.lastName;
          associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

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

        context('When student found based on his...', () => {

          it('...firstName', async () => {
            // given
            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...middleName', async () => {
            // given
            students[0].middleName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...thirdName', async () => {
            // given
            students[0].thirdName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...lastName', async () => {
            // given
            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...preferredLastName', async () => {
            // given
            students[0].firstName = user.firstName;
            students[0].preferredLastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });
        });

        context('When student found even if there is...', () => {

          it('...an accent', async () => {
            // given
            user.firstName = 'Joé';

            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...a white space', async () => {
            // given
            user.firstName = 'Jo e';

            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...a special character', async () => {
            // given
            user.firstName = 'Jo~e';

            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });

          it('...a œ', async () => {
            // given
            user.firstName = 'Jœ';

            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;
            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[0]);
          });
        });

        context('When multiple matches', () => {

          it('should prefer firstName over middleName', async () => {
            // given
            students[0].middleName = user.firstName;
            students[0].lastName = user.lastName;

            students[1].firstName = user.firstName;
            students[1].lastName = user.lastName;

            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[1].id }).resolves(students[1]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[1]);
          });

          it('should prefer middleName over thirdName', async () => {
            // given
            students[0].thirdName = user.firstName;
            students[0].lastName = user.lastName;

            students[1].middleName = user.firstName;
            students[1].lastName = user.lastName;

            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[1].id }).resolves(students[1]);

            // when
            const result = await usecases.linkUserToOrganizationStudentData({
              user,
              campaignCode,
            });

            // then
            expect(result).to.deep.equal(students[1]);
          });

          it('should prefer nobody with same lastName and preferredLastName', async () => {
            // given
            students[0].firstName = user.firstName;
            students[0].lastName = user.lastName;

            students[1].firstName = user.firstName;
            students[1].preferredLastName = user.lastName;

            associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[1].id }).resolves(students[1]);

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

        it('should associate user with student', async () => {
          // given
          students[0].userId = user.id;
          students[0].firstName = user.firstName;
          students[0].lastName = user.lastName;
          associateUserAndStudentStub.withArgs({ userId: user.id, studentId: students[0].id }).resolves(students[0]);

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
