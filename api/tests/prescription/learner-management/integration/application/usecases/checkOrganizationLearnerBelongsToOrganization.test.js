import { execute } from '../../../../../../src/prescription/learner-management/application/usecases/checkOrganizationLearnerBelongsToOrganization.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Prescription | Learner Management | Application | UseCase | checkOrganizationLearnerBelongsToOrganization', function () {
  describe('#execute', function () {
    it('should return true when organization learner belongs to the organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'John',
        lastName: 'Doe',
      });
      await databaseBuilder.commit();

      // when
      const result = await execute(organization.id, organizationLearner.id);

      // then
      expect(result).to.be.true;
    });

    it('should return false when organization learner belongs to a different organization', async function () {
      // given
      const targetOrganization = databaseBuilder.factory.buildOrganization();
      const otherOrganization = databaseBuilder.factory.buildOrganization();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganization.id,
        firstName: 'John',
        lastName: 'Doe',
      });
      await databaseBuilder.commit();

      // when
      const result = await execute(targetOrganization.id, organizationLearner.id);

      // then
      expect(result).to.be.false;
    });

    it('should throw NotFoundError when organization learner does not exist', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const nonExistentOrganizationLearnerId = 999999;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(execute)(organization.id, nonExistentOrganizationLearnerId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Student not found for ID ${nonExistentOrganizationLearnerId}`);
    });
  });
});
