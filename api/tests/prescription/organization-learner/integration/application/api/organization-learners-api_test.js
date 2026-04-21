import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/application/api/models/OrganizationLearner.js';
import * as organizationLearnersApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-api.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

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

    context('when there is only a pagination', function () {
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
      expect(learner).instanceOf(OrganizationLearner);
    });
  });

  describe('#findByUserId', function () {
    it('should return empty array if no user match', async function () {
      //when
      const learners = await organizationLearnersApi.findByUserId(123);

      // then
      expect(learners).lengthOf(0);
    });
    it('should return organization learner associated to a given userId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const learner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      const otherLearnerWithSameUser = databaseBuilder.factory.buildOrganizationLearner({
        userId: learner.userId,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });

      await databaseBuilder.commit();

      // when
      const learners = await organizationLearnersApi.findByUserId(learner.userId);

      // then
      expect(learners).lengthOf(2);
      expect(learners).deep.members([
        {
          id: learner.id,
          firstName: learner.firstName,
          lastName: learner.lastName,
          features: learner.features,
          userId: learner.userId,
          organizationId: learner.organizationId,
          division: undefined,
        },
        {
          id: otherLearnerWithSameUser.id,
          firstName: otherLearnerWithSameUser.firstName,
          lastName: otherLearnerWithSameUser.lastName,
          features: otherLearnerWithSameUser.features,
          userId: otherLearnerWithSameUser.userId,
          organizationId: otherLearnerWithSameUser.organizationId,
          division: undefined,
        },
      ]);
    });
  });
});
