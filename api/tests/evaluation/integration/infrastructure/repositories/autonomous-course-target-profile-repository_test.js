import { databaseBuilder, expect, sinon, catchErr } from '../../../../test-helper.js';
import { repositories } from '../../../../../src/evaluation/infrastructure/repositories/index.js';
import { constants } from '../../../../../lib/domain/constants.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { AutonomousCourseTargetProfile } from '../../../../../src/evaluation/domain/models/AutonomousCourseTargetProfile.js';

describe('Integration | Repository | Autonomous Course Target Profile', function () {
  let userId, organization;

  beforeEach(async function () {
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

    userId = databaseBuilder.factory.buildUser().id;

    organization = databaseBuilder.factory.buildOrganization({
      id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
    });

    await databaseBuilder.commit();
  });

  describe('#get', function () {
    context('when autonomous courses organization ownes existing target-profiles', function () {
      it('should return a list of owned target-profiles', async function () {
        // given
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });

        const targetProfile1 = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: organization.id,
          isPublic: true,
          isSimplifiedAccess: true,
          name: 'Target profile 1',
        });
        const targetProfile2 = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: organization.id,
          isPublic: false,
          isSimplifiedAccess: true,
          name: 'Target profile 2',
        });
        const targetProfile3 = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: otherOrganization.id,
          isPublic: false,
          isSimplifiedAccess: false,
          name: 'Target profile 3',
        });
        const targetProfile4 = databaseBuilder.factory.buildTargetProfile({
          ownerOrganizationId: organization.id,
          isPublic: true,
          isSimplifiedAccess: false,
          name: 'Target profile 4',
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: organization.id,
          targetProfileId: targetProfile1.id,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: organization.id,
          targetProfileId: targetProfile2.id,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId: otherOrganization.id,
          targetProfileId: targetProfile3.id,
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
