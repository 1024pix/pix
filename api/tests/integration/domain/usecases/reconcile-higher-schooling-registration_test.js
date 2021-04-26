const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

const reconcileHigherSchoolingRegistration = require('../../../../lib/domain/usecases/reconcile-higher-schooling-registration');

describe('Integration | UseCases | reconcile-higher-schooling-registration', () => {

  let userId;
  let organizationId;
  let campaignCode;

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(reconcileHigherSchoolingRegistration)({
        campaignCode: 'NOTEXIST',
        reconciliationInfo: {},
        campaignRepository,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
    });
  });

  context('When there is a campaign with the given code', () => {
    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({ firstName: 'Valentin', lastName: 'Frangin', birthdate: '2010-12-12' }).id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;

      await databaseBuilder.commit();
    });

    context('When no registered schooling registration found with matching student number, firstName, lastName and birthdate', () => {
      it('should throw an error', async () => {
        // given
        const reconciliationInfo = {
          userId,
          studentNumber: '123',
          firstName: 'firstname',
          lastName: 'lastname',
          birthdate: '2008-01-01',
        };
        databaseBuilder.factory.buildSchoolingRegistration({ studentNumber: '123', userId: null, organizationId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(reconcileHigherSchoolingRegistration)({
          campaignCode,
          reconciliationInfo,
          campaignRepository,
          higherSchoolingRegistrationRepository,
          schoolingRegistrationRepository,
          userReconciliationService,
        });

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });

    context('When a matching registered schooling registration is found', () => {
      context('and is not reconciled yet', () => {
        it('should reconcile schooling registration with user', async () => {
        // given
          const reconciliationInfo = {
            userId,
            studentNumber: '123',
            firstName: 'firstname',
            lastName: 'lastname',
            birthdate: '2008-01-01',
          };
          databaseBuilder.factory.buildSchoolingRegistration({
            ...reconciliationInfo,
            firstName: 'first name',
            isSupernumerary: false,
            userId: null,
            organizationId,
          });
          await databaseBuilder.commit();

          // when
          await reconcileHigherSchoolingRegistration({
            campaignCode,
            reconciliationInfo,
            campaignRepository,
            higherSchoolingRegistrationRepository,
            schoolingRegistrationRepository,
            userReconciliationService,
          });

          // then
          const [schoolingRegistration] = await knex('schooling-registrations');
          expect(schoolingRegistration.userId).to.equal(userId);
          expect(schoolingRegistration.firstName).to.equal('first name');
          expect(schoolingRegistration.isSupernumerary).to.be.false;
        });
      });

      context('but already reconciled', () => {
        it('should throw an error', async () => {
          // given
          const reconciliationInfo = {
            userId,
            studentNumber: '123',
            firstName: 'firstname',
            lastName: 'lastname',
            birthdate: '2008-01-01',
          };
          const otherUserId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildSchoolingRegistration({ ...reconciliationInfo, userId: otherUserId, isSupernumerary: false, organizationId });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(reconcileHigherSchoolingRegistration)({
            campaignCode,
            reconciliationInfo,
            campaignRepository,
            higherSchoolingRegistrationRepository,
            schoolingRegistrationRepository,
            userReconciliationService,
          });

          // then
          expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
        });
      });
    });
  });
});
