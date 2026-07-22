import { AutonomousCourseTargetProfile } from '../../../../../src/evaluation/domain/models/AutonomousCourseTargetProfile.js';
import { repositories } from '../../../../../src/evaluation/infrastructure/repositories/index.js';
import { config } from '../../../../../src/shared/config.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Autonomous Course Target Profile', function () {
  let userId, organization;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;

    organization = databaseBuilder.factory.buildOrganization({
      id: config.autonomousCourse.autonomousCoursesOrganizationId,
    });

    await databaseBuilder.commit();
  });

  describe('#get', function () {
    context('when autonomous courses organization ownes existing target-profiles', function () {
      it('should return a list of owned target-profiles', async function () {
        // given
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });

        const targetProfile2 = databaseBuilder.factory.buildTargetProfile({
          isSimplifiedAccess: true,
          name: 'Target profile 2',
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: organization.id,
          targetProfileId: targetProfile2.id,
        });

        const targetProfile3 = databaseBuilder.factory.buildTargetProfile({
          isSimplifiedAccess: false,
          name: 'Target profile 3',
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: otherOrganization.id,
          targetProfileId: targetProfile3.id,
        });

        const targetProfile4 = databaseBuilder.factory.buildTargetProfile({
          isSimplifiedAccess: false,
          name: 'Target profile 4',
        });

        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: organization.id,
          targetProfileId: targetProfile4.id,
        });

        await databaseBuilder.commit();

        const expectedResult = [
          {
            id: targetProfile2.id,
            category: targetProfile2.category,
            name: targetProfile2.name,
          },
        ];
        // when
        const autonomousCourseTargetProfile = await repositories.autonomousCourseTargetProfileRepository.get();

        // then
        expect(autonomousCourseTargetProfile[0]).to.be.instanceOf(AutonomousCourseTargetProfile);
        expect(autonomousCourseTargetProfile).to.deep.equal(expectedResult);
      });
    });

    context("when autonomous courses organization doesn't own target-profiles", function () {
      it('should return an error', async function () {
        // when
        const error = await catchErr(repositories.autonomousCourseTargetProfileRepository.get)();

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
