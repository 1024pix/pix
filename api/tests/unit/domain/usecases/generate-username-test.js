const { expect, sinon, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const { CampaignCodeError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | generate-username', () => {

  const organizationId = 1;

  let campaignCode;
  let findMatchingStudentIdForGivenOrganizationIdAndUserStub;
  let createUsernameByUserServiceStub;
  let getCampaignStub;
  let user;

  beforeEach(() => {
    campaignCode = 'RESTRICTD';

    user = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '1992-02-02',
    };

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    findMatchingStudentIdForGivenOrganizationIdAndUserStub = sinon.stub(userReconciliationService,'findMatchingStudentIdForGivenOrganizationIdAndUser');
    createUsernameByUserServiceStub = sinon.stub(userReconciliationService,'createUsernameByUser');
  });

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // given
      getCampaignStub.withArgs(campaignCode).resolves(null);

      // when
      const result = await catchErr(usecases.generateUsername)({
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
      const result = await catchErr(usecases.generateUsername)({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.instanceof(NotFoundError);
      expect(result.message).to.equal('Error message');
    });
  });

  context('When one student matched on names', () => {

    it('should return student ID found', async () => {
      // given
      const user = {
        firstName: 'fist',
        lastName: 'last',
        birthdate: '2008-12-01'
      };
      const username = user.firstName + '.' + user.lastName + '0112';

      findMatchingStudentIdForGivenOrganizationIdAndUserStub.resolves();
      createUsernameByUserServiceStub.resolves(username);

      // when
      const result = await usecases.generateUsername({
        user,
        campaignCode,
      });

      // then
      expect(result).to.be.equal(username);
    });
  });
});
