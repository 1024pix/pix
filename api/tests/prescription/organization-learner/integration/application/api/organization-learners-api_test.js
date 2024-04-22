import * as organizationLearnersApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-api.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | API | Organization Learner', function () {
  describe('#find', function () {
    context('when there is no pagination', function () {
      it('should return all learners', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationLearner1Id = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        }).id;
        const organizationLearner2Id = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
        }).id;
        await databaseBuilder.commit();
        // when
        const { organizationLearners } = await organizationLearnersApi.find({
          organizationId,
        });

        // then
        expect(organizationLearners.map(({ id }) => id)).to.have.members([
          organizationLearner1Id,
          organizationLearner2Id,
        ]);
      });
    });

    context('when there is a pagination', function () {
      it('should return all learners from the selected page', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Arachibal',
        });
        const organizationLearner2Id = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          lastName: 'Zoro',
        }).id;
        await databaseBuilder.commit();
        // when
        const { organizationLearners } = await organizationLearnersApi.find({
          organizationId,
          page: { size: 1, number: 2 },
        });

        // then
        expect(organizationLearners.map(({ id }) => id)).to.have.members([organizationLearner2Id]);
      });
    });
  });

  describe('#get', function () {
    it('should return the learner corresponding to the id', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;
      await databaseBuilder.commit();
      // when
      const learner = await organizationLearnersApi.get(organizationLearnerId);

      // then
      expect(learner.id).to.equal(organizationLearnerId);
    });
  });
});
