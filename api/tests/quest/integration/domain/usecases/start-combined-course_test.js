import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Combined course | Domain | UseCases | start-combined-course', function () {
  describe('when combined-course participation does not exist', function () {
    it('should create combined-course participation', async function () {
      //given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        organizationId,
        code: 'COMBINIX8',
      });
      await databaseBuilder.commit();

      //when
      await usecases.startCombinedCourse({
        userId: organizationLearner.userId,
        code: 'COMBINIX8',
      });

      //then
      const [participation] = await knex('organization_learner_participations')
        .select('organizationLearnerId', 'status', 'referenceId')
        .where({
          referenceId: combinedCourseId.toString(),
          organizationLearnerId: organizationLearner.id,
        });

      expect(participation.referenceId).to.equal(combinedCourseId.toString());
      expect(participation.organizationLearnerId).to.deep.equal(organizationLearner.id);
      expect(participation.status).to.deep.equal(OrganizationLearnerParticipationStatuses.STARTED);
    });
    describe('when organization learner does not exist', function () {
      it('should also create organization learner', async function () {
        //given
        const user = databaseBuilder.factory.buildUser();
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildCombinedCourse({ organizationId, code: 'COMBINIX8' });

        await databaseBuilder.commit();

        const organizationLearner = domainBuilder.buildOrganizationLearner({
          firstName: user.firstName,
          lastName: user.lastName,
        });

        //when
        await usecases.startCombinedCourse({
          userId: user.id,
          code: 'COMBINIX8',
        });

        //then
        const createdOrganizationLearner = await knex('organization-learners').where({
          firstName: organizationLearner.firstName,
          lastName: organizationLearner.lastName,
        });

        const [participation] = await knex('organization_learner_participations').where({
          organizationLearnerId: createdOrganizationLearner[0].id,
        });

        expect(createdOrganizationLearner).lengthOf(1);
        expect(participation.organizationLearnerId).to.deep.equal(createdOrganizationLearner[0].id);
      });
    });
  });
});
