import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';
import { repositories } from '../../../../../src/evaluation/infrastructure/repositories/index.js';
import { constants } from '../../../../../lib/domain/constants.js';

describe('Integration | Repository | Autonomous Course', function () {
  afterEach(function () {
    return knex('autonomous-courses').delete();
  });

  it('#save', async function () {
    // given
    sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
    const { id: userId } = databaseBuilder.factory.buildUser();
    const { id: organizationId } = databaseBuilder.factory.buildOrganization({
      id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
    });
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

    await databaseBuilder.commit();

    // when
    const savedAutonomousCourseId = await repositories.autonomousCourseRepository.save({
      autonomousCourse: {
        ownerId: userId,
        organizationId,
        targetProfileId,
        publicTitle: 'public title',
        internalTitle: 'internal title',
        customLandingPageText: 'custom landing text page text',
      },
    });

    // then
    expect(savedAutonomousCourseId).to.be.above(0);
  });
});
