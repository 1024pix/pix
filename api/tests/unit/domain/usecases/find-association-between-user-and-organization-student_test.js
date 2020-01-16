const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Student = require('../../../../lib/domain/models/Student');
const { CampaignCodeError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');

describe('Unit | UseCase | find-association-between-user-and-organization-student', () => {

  let studentReceivedStub;
  let getCampaignStub;
  let student;
  let organizationId;
  let userId;
  let campaignCode;

  beforeEach(() => {
    userId = domainBuilder.buildUser().id;
    organizationId = domainBuilder.buildOrganization().id;
    campaignCode = domainBuilder.buildCampaign({ organizationId }).code;
    student = domainBuilder.buildStudent({ organizationId, userId });
    getCampaignStub = sinon.stub(campaignRepository, 'getByCode').throws('unexpected call');
    studentReceivedStub = sinon.stub(studentRepository, 'findOneByUserIdAndOrganizationId').throws('unexpected call');
  });

  describe('There is a student linked to the given userId', () => {

    it('should call findOneByUserIdAndOrganizationId', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      studentReceivedStub.resolves({});

      // when
      await usecases.findAssociationBetweenUserAndOrganizationStudent({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(studentReceivedStub).to.have.been.calledOnce;
    });

    it('should return the student', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      studentReceivedStub.withArgs({ userId, organizationId }).resolves(student);

      // when
      const result = await usecases.findAssociationBetweenUserAndOrganizationStudent({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.deep.equal(student);
      expect(result).to.be.instanceof(Student);
    });
  });

  describe('There is no student linked to the given userId', () => {

    it('should return the repositories returns', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      studentReceivedStub.withArgs({ userId, organizationId }).resolves(null);

      // when
      const result = await usecases.findAssociationBetweenUserAndOrganizationStudent({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('The authenticated user is not the same as requested user', () => {

    it('should return the repositories error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves({ organizationId });
      studentReceivedStub.withArgs({ userId, organizationId }).resolves(null);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndOrganizationStudent)({ authenticatedUserId: '999', requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.instanceof(UserNotAuthorizedToAccessEntity);
    });
  });

  describe('There is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.findAssociationBetweenUserAndOrganizationStudent)({ authenticatedUserId: userId, requestedUserId: userId, campaignCode });

      // then
      expect(result).to.be.instanceof(CampaignCodeError);
    });
  });
});
