import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-course/CombinedCourse.js';
import { CombinedCourseParticipation } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseParticipation.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | get-combined-courses-by-organization-id', function () {
  it('should return combined courses for an organization with their participations and pagination metadata', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE1',
      name: 'First Combined Course',
      organizationId,
    });
    const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE2',
      name: 'Second Combined Course',
      organizationId,
    });

    const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Alice',
      lastName: 'Anderson',
    });
    const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Bob',
      lastName: 'Brown',
    });
    const { id: organizationLearnerId3 } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Charlie',
      lastName: 'Clark',
    });

    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      organizationLearnerId: organizationLearnerId1,
      combinedCourseId: combinedCourseId1,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      combinedCourseId: combinedCourseId1,
      organizationLearnerId: organizationLearnerId2,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      combinedCourseId: combinedCourseId2,
      organizationLearnerId: organizationLearnerId3,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCoursesByOrganizationId({ organizationId });

    // then
    expect(result.combinedCourses).to.have.lengthOf(2);
    expect(result.combinedCourses[0]).to.be.an.instanceof(CombinedCourse);
    expect(result.combinedCourses[1]).to.be.an.instanceof(CombinedCourse);
    expect(result.meta).to.deep.include({
      page: 1,
      pageSize: 10,
      rowCount: 2,
      pageCount: 1,
    });

    const firstCourse = result.combinedCourses.find((course) => course.id === combinedCourseId1);
    const secondCourse = result.combinedCourses.find((course) => course.id === combinedCourseId2);

    expect(firstCourse.code).to.equal('COURSE1');
    expect(firstCourse.name).to.equal('First Combined Course');
    expect(firstCourse.participations).to.have.lengthOf(2);
    expect(firstCourse.participations[0]).to.be.an.instanceof(CombinedCourseParticipation);
    expect(firstCourse.participations[0].status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
    expect(firstCourse.participations[0].combinedCourseId).to.equal(combinedCourseId1);
    expect(firstCourse.participations[1].status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
    expect(firstCourse.participations[1].combinedCourseId).to.equal(combinedCourseId1);

    expect(secondCourse.code).to.equal('COURSE2');
    expect(secondCourse.name).to.equal('Second Combined Course');
    expect(secondCourse.participations).to.have.lengthOf(1);
    expect(secondCourse.participations[0]).to.be.an.instanceof(CombinedCourseParticipation);
    expect(secondCourse.participations[0].status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
    expect(secondCourse.participations[0].combinedCourseId).to.equal(combinedCourseId2);
  });

  it('should return combined courses with empty participations when no participations exist', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE3',
      name: 'Third Combined Course',
      organizationId,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCoursesByOrganizationId({ organizationId });

    // then
    expect(result.combinedCourses).to.have.lengthOf(1);
    expect(result.combinedCourses[0]).to.be.an.instanceof(CombinedCourse);
    expect(result.combinedCourses[0].id).to.equal(combinedCourseId1);
    expect(result.combinedCourses[0].code).to.equal('COURSE3');
    expect(result.combinedCourses[0].participations).to.deep.equal([]);
  });

  it('should return empty array when no combined courses exist for organization', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCoursesByOrganizationId({ organizationId });

    // then
    expect(result.combinedCourses).to.deep.equal([]);
  });

  it('should not return combined courses from other organizations', async function () {
    // given
    const { id: organizationId1 } = databaseBuilder.factory.buildOrganization();
    const { id: organizationId2 } = databaseBuilder.factory.buildOrganization();

    databaseBuilder.factory.buildCombinedCourse({
      code: 'ORG1COURSE',
      organizationId: organizationId1,
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'ORG2COURSE',
      organizationId: organizationId2,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCoursesByOrganizationId({ organizationId: organizationId1 });

    // then
    expect(result.combinedCourses).to.have.lengthOf(1);
    expect(result.combinedCourses[0].code).to.equal('ORG1COURSE');
  });

  it('should not include participations from other combined courses', async function () {
    // given
    const { id: organizationId } = databaseBuilder.factory.buildOrganization();
    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE1',
      organizationId,
    });
    const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'COURSE2',
      organizationId,
    });

    const { id: organizationLearnerId1 } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Alice',
      lastName: 'Anderson',
    });
    const { id: organizationLearnerId2 } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      firstName: 'Bob',
      lastName: 'Brown',
    });

    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      combinedCourseId: combinedCourseId1,
      organizationLearnerId: organizationLearnerId1,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.STARTED,
      combinedCourseId: combinedCourseId2,
      organizationLearnerId: organizationLearnerId2,
    });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCoursesByOrganizationId({ organizationId });

    // then
    const firstCourse = result.combinedCourses.find((course) => course.id === combinedCourseId1);
    const secondCourse = result.combinedCourses.find((course) => course.id === combinedCourseId2);

    expect(firstCourse.participations).to.have.lengthOf(1);
    expect(firstCourse.participations[0].combinedCourseId).to.equal(combinedCourseId1);
    expect(firstCourse.participations[0].status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);

    expect(secondCourse.participations).to.have.lengthOf(1);
    expect(secondCourse.participations[0].combinedCourseId).to.equal(combinedCourseId2);
    expect(secondCourse.participations[0].status).to.equal(OrganizationLearnerParticipationStatuses.STARTED);
  });
});
