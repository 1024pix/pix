import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { UserCouldNotBeReconciledError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | UseCases | reconcile-sco-organization-learner-automatically', function () {
  context('When user has no nationalStudentId', function () {
    it('should throw a UserCouldNotBeReconciledError code error', async function () {
      // when
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();

      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        nationalStudentId: null,
        firstName: 'old-learner-in-orga-without-import',
      });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId: '1234',
        firstName: 'new-learner-in-sco-with-import',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId: null,
        firstName: '(anonymised)',
        deletedAt: new Date(),
      });

      await databaseBuilder.commit();

      const error = await catchErr(usecases.reconcileScoOrganizationLearnerAutomatically)({
        organizationId: organization.id,
        userId: user.id,
      });

      // then
      expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
    });
  });
});
