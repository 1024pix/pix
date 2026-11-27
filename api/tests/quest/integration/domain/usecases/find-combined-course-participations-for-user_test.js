import { expect } from 'chai';

import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Domain | Usecases | findCombinedCourseParticipationsForUser', function () {
  let user;

  beforeEach(async function () {
    user = databaseBuilder.factory.buildUser();
  });

  it('should return false if ExploreIA ids list is not defined', async function () {
    // given
    const combinedCourseIdsExploreIA = undefined;

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return false if ExploreIA ids list has incorrect format', async function () {
    // given
    const combinedCourseIdsExploreIA = Symbol('string');

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return false if ExploreIA ids list is empty', async function () {
    // given
    const combinedCourseIdsExploreIA = [];

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return false if user has no participation', async function () {
    // given
    const combinedCourseIdsExploreIA = [1, 2, 3];

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return false if user has no participation for ExploreIA combined courses', async function () {
    // given
    const combinedCourseExploreIA1 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE1' });
    const combinedCourseExploreIA2 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE2' });
    const combinedCourseExploreIA3 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE3' });
    const combinedCourseNotExploreIA = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE4' });

    const combinedCourseIdsExploreIA = [
      combinedCourseExploreIA1.id,
      combinedCourseExploreIA2.id,
      combinedCourseExploreIA3.id,
    ];

    const learner = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      organizationLearnerId: learner.id,
      combinedCourseId: combinedCourseNotExploreIA.id,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });
    await databaseBuilder.commit();

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.false;
  });

  it('should return true if user is missing a participation for an ExploreIA combined course', async function () {
    // given
    const combinedCourseExploreIA1 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE1' });
    const combinedCourseExploreIA2 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE2' });
    const combinedCourseExploreIA3 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE3' });

    const combinedCourseIdsExploreIA = [
      combinedCourseExploreIA1.id,
      combinedCourseExploreIA2.id,
      combinedCourseExploreIA3.id,
    ];

    const learner = databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      organizationLearnerId: learner.id,
      combinedCourseId: combinedCourseExploreIA1.id,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      organizationLearnerId: learner.id,
      combinedCourseId: combinedCourseExploreIA2.id,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });
    await databaseBuilder.commit();

    //when
    const result = await usecases.findCombinedCourseParticipationsForUser({
      userId: user.id,
      combinedCourseIdsExploreIA,
    });

    // then
    expect(result).to.be.true;
  });

  describe('if user has a participation for each ExploreIA combined course', function () {
    it('should return false if all participations are completed', async function () {
      // given
      const combinedCourseExploreIA1 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE1' });
      const combinedCourseExploreIA2 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE2' });
      const combinedCourseExploreIA3 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE3' });

      const combinedCourseIdsExploreIA = [
        combinedCourseExploreIA1.id,
        combinedCourseExploreIA2.id,
        combinedCourseExploreIA3.id,
      ];

      const learner = databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA1.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA2.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA3.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      await databaseBuilder.commit();

      //when
      const result = await usecases.findCombinedCourseParticipationsForUser({
        userId: user.id,
        combinedCourseIdsExploreIA,
      });

      // then
      expect(result).to.be.false;
    });

    it('should return true if at least one participation is not completed', async function () {
      // given
      const combinedCourseExploreIA1 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE1' });
      const combinedCourseExploreIA2 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE2' });
      const combinedCourseExploreIA3 = databaseBuilder.factory.buildCombinedCourse({ code: 'CODE3' });

      const combinedCourseIdsExploreIA = [
        combinedCourseExploreIA1.id,
        combinedCourseExploreIA2.id,
        combinedCourseExploreIA3.id,
      ];

      const learner = databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA1.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA2.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: learner.id,
        combinedCourseId: combinedCourseExploreIA3.id,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
      });
      await databaseBuilder.commit();

      //when
      const result = await usecases.findCombinedCourseParticipationsForUser({
        userId: user.id,
        combinedCourseIdsExploreIA,
      });

      // then
      expect(result).to.be.true;
    });
  });
});
