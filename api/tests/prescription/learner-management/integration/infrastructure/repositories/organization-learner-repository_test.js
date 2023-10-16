import { expect, knex, databaseBuilder, sinon } from '../../../../../test-helper.js';
import { removeByIds } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner', function () {
  describe('#removeByIds', function () {
    let clock;
    const now = new Date('2023-02-02');
    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });
    afterEach(function () {
      clock.restore();
    });

    it('delete one organization learner', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const organizationLearnersIdsToDelete = [organizationLearnerId];

      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByIds({ organizationLearnerIds: organizationLearnersIdsToDelete, userId, domainTransaction });
      });

      // then
      const organizationLearnerResult = await knex('organization-learners')
        .select('deletedAt', 'deletedBy')
        .where('id', organizationLearnerId)
        .first();

      expect(organizationLearnerResult.deletedAt).to.deep.equal(now);
      expect(organizationLearnerResult.deletedBy).to.equal(userId);
    });

    it('delete more than one organization learners at the same time', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const firstOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const thirdOrganisationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const organizationLearnersIdToDelete = [firstOrganizationLearnerId, secondOrganizationLearnerId];

      await DomainTransaction.execute(async (domainTransaction) => {
        await removeByIds({ organizationLearnerIds: organizationLearnersIdToDelete, userId, domainTransaction });
      });

      // then
      const learners = await knex('view-active-organization-learners').where({ organizationId });
      expect(learners.length).to.equal(1);
      expect(learners[0].id).to.equal(thirdOrganisationLearnerId);
    });
  });
});
