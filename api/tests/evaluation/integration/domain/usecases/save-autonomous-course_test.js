import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  mockLearningContent,
  learningContentBuilder,
  sinon,
} from '../../../../test-helper.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import {
  NotFoundError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
} from '../../../../../src/shared/domain/errors.js';
import { constants } from '../../../../../lib/domain/constants.js';

describe('Integration | Usecases | Save autonomous course', function () {
  beforeEach(async function () {
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

    databaseBuilder.factory.buildTargetProfile({
      id: 1,
    });

    await databaseBuilder.commit();

    const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
    const learningContentObjects = learningContentBuilder([learningContent]);
    mockLearningContent(learningContentObjects);
  });

  context('when target-profile does not exist', function () {
    it('should throw a not found error', async function () {
      // when
      const error = await catchErr(evaluationUsecases.saveAutonomousCourse)({
        autonomousCourse: {
          targetProfileId: 777,
        },
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No target profile found for ID 777');
    });
  });

  context('when target-profile organization is not shared with organization', function () {
    context('and autonomous course organization is not the owner', function () {
      it('should throw an error', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({
          id: 34,
        });
        const otherOrganization = databaseBuilder.factory.buildOrganization();

        const targetProfileNotOwnedByAutonomousCourse = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: organization.id,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: otherOrganization.id,
          targetProfileId: targetProfileNotOwnedByAutonomousCourse.id,
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(evaluationUsecases.saveAutonomousCourse)({
          autonomousCourse: {
            targetProfileId: targetProfileNotOwnedByAutonomousCourse.id,
          },
        });

        // then
        expect(error).to.be.instanceOf(TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization);
        expect(error.message).to.equal('Target profile requires to be linked to autonomous course organization.');
      });
    });

    context('and autonomous course organization is the owner', function () {
      it('should save the autonomous course', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();

        const organization = databaseBuilder.factory.buildOrganization({
          id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        });

        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });

        const targetProfileOwnedByAutonomousCourseOrganization = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: organization.id,
          isSimplifiedAccess: true,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: organization.id,
          targetProfileId: targetProfileOwnedByAutonomousCourseOrganization.id,
        });

        await databaseBuilder.commit();

        // when
        const autonomousCourseId = await evaluationUsecases.saveAutonomousCourse({
          autonomousCourse: {
            ownerId: userId,
            targetProfileId: targetProfileOwnedByAutonomousCourseOrganization.id,
            publicTitle: 'public title',
            internalTitle: 'internal title',
            customLandingPageText: 'custom landing text page text',
          },
        });

        // then
        expect(autonomousCourseId).to.be.above(0);
      });
    });
  });
});
