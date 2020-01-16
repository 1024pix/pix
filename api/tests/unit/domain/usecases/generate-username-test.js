const { expect, sinon, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const { CampaignCodeError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-association-possibilities', () => {

  let campaignCode;
  let findMatchingOrganizationStudentIdForGivenUserStub;
  let createUsernameByUserServiceStub;
  let getCampaignStub;
  let user;
  const organizationId = 1;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    campaignCode = 'ABCD12';

    user = {
      id: 1,
      firstName: 'Joe',
      lastName: 'Poe',
      birthdate: '02-02-1992',
    };

    getCampaignStub = sinon.stub(campaignRepository, 'getByCode')
      .withArgs(campaignCode)
      .resolves({ organizationId });

    findMatchingOrganizationStudentIdForGivenUserStub = sinon.stub(userReconciliationService,'findMatchingOrganizationStudentIdForGivenUser');
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
      findMatchingOrganizationStudentIdForGivenUserStub.throws(new NotFoundError('Error message'));

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

      findMatchingOrganizationStudentIdForGivenUserStub.resolves();
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
