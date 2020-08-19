const { catchErr, databaseBuilder, expect } = require('../../../test-helper');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const obfuscationService = require('../../../../lib/domain/services/obfuscation-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const tokenService = require('../../../../lib/domain/services/token-service');

const { CampaignCodeError, NotFoundError, ObjectValidationError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

const createUserAndReconcileToSchoolingRegistrationByExternalUser = require('../../../../lib/domain/usecases/create-user-and-reconcile-to-schooling-registration-from-external-user');

describe('Integration | UseCases | create-user-and-reconcile-to-schooling-registration-from-external-user', () => {

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({ campaignCode: 'NOTEXIST', campaignRepository });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When the token is invalid', () => {

    let campaignCode;

    beforeEach(async () => {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
    });

    context('When the firstName is empty', () => {

      it('should throw an ObjectValidationError', async () => {
        // given
        const userAttributes = {
          NOM: 'Jackson',
          IDO: 'SamlId'
        };
        const token = tokenService.createTokenForStudentReconciliation({ userAttributes });
        // when
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({ campaignCode, token, tokenService, campaignRepository });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });

    context('When the lastName is empty', () => {

      it('should throw an ObjectValidationError', async () => {
        // given
        const userAttributes = {
          PRE: 'Saml',
          IDO: 'SamlId'
        };
        const token = tokenService.createTokenForStudentReconciliation({ userAttributes });
        // when
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({ campaignCode, token, tokenService, campaignRepository });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });

    context('When the samlId is empty', () => {

      it('should throw an ObjectValidationError', async () => {
        // given
        const userAttributes = {
          PRE: 'Saml',
          NOM: 'Jackson',
        };
        const token = tokenService.createTokenForStudentReconciliation({ userAttributes });
        // when
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({ campaignCode, token, tokenService, campaignRepository });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });

  });

  context('When no schoolingRegistration is found', () => {

    let campaignCode;
    let token;

    beforeEach(async () => {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
      const userAttributes = {
        PRE: 'Saml',
        NOM: 'Jackson',
        IDO: 'SamlId',
      };
      token = tokenService.createTokenForStudentReconciliation({ userAttributes });
    });

    it('should throw a Not Found error', async () => {
      // given
      const birthdate = '2008-01-01';

      // when
      const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
        campaignCode, token, birthdate,
        campaignRepository, tokenService, userReconciliationService, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There are no schooling registrations found');
    });
  });

  context('When a schoolingRegistration match the token data and birthdate', () => {

    const firstName = 'Saml';
    const lastName = 'Jackson';
    const samlId = 'SamlId';

    let campaignCode;
    let organizationId;
    let token;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;
      await databaseBuilder.commit();

      const userAttributes = { PRE: firstName, NOM: lastName, IDO: samlId };
      token = tokenService.createTokenForStudentReconciliation({ userAttributes });
    });

    it('should create and reconcile the external user', async () => {
      // given
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ firstName, lastName, organizationId });
      schoolingRegistration.userId = undefined;
      await databaseBuilder.commit();

      // when
      const user = await createUserAndReconcileToSchoolingRegistrationByExternalUser({ campaignCode, token,
        birthdate: schoolingRegistration.birthdate, campaignRepository, tokenService, schoolingRegistrationRepository,
        userRepository, userReconciliationService, obfuscationService });

      // then
      expect(user.firstName).to.equal(firstName);
      expect(user.lastName).to.equal(lastName);
      expect(user.samlId).to.equal(samlId);
      expect(user.password).to.be.empty;
      expect(user.cgu).to.be.false;
    });

    context('When the external user is already reconciled', () => {

      it('should throw a SchoolingRegistrationAlreadyLinkedToUserError', async () => {
        // given
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ firstName, lastName, organizationId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
          campaignCode, token, birthdate: schoolingRegistration.birthdate, campaignRepository, tokenService,
          schoolingRegistrationRepository, userRepository, userReconciliationService, obfuscationService
        });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
      });
    });
  });
});
