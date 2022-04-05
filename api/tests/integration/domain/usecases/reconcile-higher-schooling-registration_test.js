const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const { NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');

const reconcileHigherSchoolingRegistration = require('../../../../lib/domain/usecases/reconcile-higher-schooling-registration');

describe('Integration | UseCases | reconcile-higher-schooling-registration', function () {
  let userId;
  let organizationId;
  let campaignCode;

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
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

  context('When there is a campaign with the given code', function () {
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser({
        firstName: 'Valentin',
        lastName: 'Frangin',
        birthdate: '2010-12-12',
      }).id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;

      await databaseBuilder.commit();
    });

    context(
      'When no registered schooling registration found with matching student number, firstName, lastName and birthdate',
      function () {
        it('should throw an error', async function () {
          // given
          const reconciliationInfo = {
            userId,
            studentNumber: '123',
            firstName: 'firstname',
            lastName: 'lastname',
            birthdate: '2008-01-01',
          };
          databaseBuilder.factory.buildOrganizationLearner({ studentNumber: '123', userId: null, organizationId });
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
      }
    );

    context('When a matching registered schooling registration is found', function () {
      context('and is not reconciled yet', function () {
        it('should reconcile schooling registration with user', async function () {
          // given
          const reconciliationInfo = {
            userId,
            studentNumber: '123',
            firstName: 'firstname',
            lastName: 'lastname',
            birthdate: '2008-01-01',
          };
          databaseBuilder.factory.buildOrganizationLearner({
            ...reconciliationInfo,
            firstName: 'first name',
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
          const [schoolingRegistration] = await knex('organization-learners');
          expect(schoolingRegistration.userId).to.equal(userId);
          expect(schoolingRegistration.firstName).to.equal('first name');
        });
      });

      context('but already reconciled', function () {
        it('should throw an error', async function () {
          // given
          const reconciliationInfo = {
            userId,
            studentNumber: '123',
            firstName: 'firstname',
            lastName: 'lastname',
            birthdate: '2008-01-01',
          };
          const otherUserId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildOrganizationLearner({
            ...reconciliationInfo,
            userId: otherUserId,
            organizationId,
          });
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
