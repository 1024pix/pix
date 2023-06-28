import { expect, databaseBuilder, knex, catchErr } from '../../../test-helper.js';
import * as userReconciliationService from '../../../../lib/shared/domain/services/user-reconciliation-service.js';
import * as campaignRepository from '../../../../lib/shared/infrastructure/repositories/campaign-repository.js';
import * as supOrganizationLearnerRepository from '../../../../lib/shared/infrastructure/repositories/sup-organization-learner-repository.js';
import * as organizationLearnerRepository from '../../../../lib/shared/infrastructure/repositories/organization-learner-repository.js';
import { NotFoundError, OrganizationLearnerAlreadyLinkedToUserError } from '../../../../lib/shared/domain/errors.js';
import { reconcileSupOrganizationLearner } from '../../../../lib/shared/domain/usecases/reconcile-sup-organization-learner.js';

describe('Integration | UseCases | reconcile-sup-organization-learner', function () {
  let userId;
  let organizationId;
  let campaignCode;

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(reconcileSupOrganizationLearner)({
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
      'When no registered organization learner found with matching student number, firstName, lastName and birthdate',
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
          const error = await catchErr(reconcileSupOrganizationLearner)({
            campaignCode,
            reconciliationInfo,
            campaignRepository,
            supOrganizationLearnerRepository,
            organizationLearnerRepository,
            userReconciliationService,
          });

          // then
          expect(error).to.be.instanceof(NotFoundError);
        });
      }
    );

    context('When a matching registered organization learner is found', function () {
      context('and is not reconciled yet', function () {
        it('should reconcile organization learner with user', async function () {
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
          await reconcileSupOrganizationLearner({
            campaignCode,
            reconciliationInfo,
            campaignRepository,
            supOrganizationLearnerRepository,
            organizationLearnerRepository,
            userReconciliationService,
          });

          // then
          const [organizationLearner] = await knex('organization-learners');
          expect(organizationLearner.userId).to.equal(userId);
          expect(organizationLearner.firstName).to.equal('first name');
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
          const error = await catchErr(reconcileSupOrganizationLearner)({
            campaignCode,
            reconciliationInfo,
            campaignRepository,
            supOrganizationLearnerRepository,
            organizationLearnerRepository,
            userReconciliationService,
          });

          // then
          expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
        });
      });
    });
  });
});
