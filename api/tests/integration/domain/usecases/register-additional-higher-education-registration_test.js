const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const higherEducationRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-education-registration-repository');
const { CampaignCodeError } = require('../../../../lib/domain/errors');

const registerAdditionalHigherEducationRegistration = require('../../../../lib/domain/usecases/register-additional-higher-education-registration');

describe('Integration | UseCases | register-additional-higher-education-registration', () => {

  let userId;
  let organizationId;
  let campaignCode;

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(registerAdditionalHigherEducationRegistration)({
        campaignCode: 'NOTEXIST',
        userInfo: {},
        campaignRepository
      });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When there is a campaign with the given code', () => {
    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    it('should save the additional higher education registration with user info', async () => {
      // given
      const userInfo = {
        userId,
        studentNumber: '123A',
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2008-01-01'
      };

      // when
      await registerAdditionalHigherEducationRegistration({
        campaignCode,
        userInfo,
        campaignRepository,
        higherEducationRegistrationRepository,
      });

      // then
      const [schoolingRegistration] = await knex('schooling-registrations');
      expect(schoolingRegistration.userId).to.equal(userId);
    });
  });
});
