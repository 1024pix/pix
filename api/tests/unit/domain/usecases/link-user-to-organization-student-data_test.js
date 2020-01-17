const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const { CampaignCodeError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | link-user-to-organization-student-data', () => {

  let associateUserAndStudentStub;
  let campaignCode;
  let findMatchingStudentIdForGivenOrganizationIdAndUserStub;
  let getCampaignStub;
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

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    associateUserAndStudentStub = sinon.stub(studentRepository, 'associateUserAndStudent');
    findMatchingStudentIdForGivenOrganizationIdAndUserStub = sinon.stub(userReconciliationService,'findMatchingStudentIdForGivenOrganizationIdAndUser');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
        user,
        campaignCode
      });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no student found', () => {

    it('should throw a Not Found error', async () => {
      // given
      findMatchingStudentIdForGivenOrganizationIdAndUserStub.throws(new NotFoundError('Error message'));

      // when
      const result = await catchErr(usecases.linkUserToOrganizationStudentData)({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When one student matched on names', () => {

    it('should associate user with student', async () => {
      // given
      student.userId = user.id;
      student.firstName = user.firstName;
      student.lastName = user.lastName;
      findMatchingStudentIdForGivenOrganizationIdAndUserStub.resolves(studentId);
      associateUserAndStudentStub.withArgs({ userId: user.id, studentId }).resolves(student);

      // when
      const result = await usecases.linkUserToOrganizationStudentData({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceOf(Student);
      expect(result.userId).to.be.equal(user.id);
    });
  });
});
