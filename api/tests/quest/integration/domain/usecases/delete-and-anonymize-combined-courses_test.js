import { expect } from 'chai';
import sinon from 'sinon';

import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Combined course | Domain | UseCases | delete-and-anonymize-combined-courses', function () {
  let campaign, organization, combinedCourse, otherCombinedCourse, campaignsApiStub;

  const moduleId = 'ca47a7a8-4dc9-42bd-a1ac-4b1e849a054b';

  beforeEach(async function () {
    campaignsApiStub = {
      get: sinon.stub(),
      deleteCampaignsInCombinedCourses: sinon.stub(),
    };

    organization = databaseBuilder.factory.buildOrganization();
    campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO(),
      ],
    });
    combinedCourse = databaseBuilder.factory.buildCombinedCourse({
      questId,
      code: 'RANDOM',
    });

    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      combinedCourseId: combinedCourse.id.toString(),
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });

    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      combinedCourseId: combinedCourse.id.toString(),
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });

    otherCombinedCourse = databaseBuilder.factory.buildCombinedCourse({ organizationId: organization.id });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      organizationId: organization.id,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      combinedCourseId: otherCombinedCourse.id.toString(),
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });

    databaseBuilder.factory.buildOrganizationLearnerParticipation({
      moduleId,
      type: OrganizationLearnerParticipationTypes.PASSAGE,
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });

    await databaseBuilder.commit();
  });

  it('flags combined course, campaign linked to combined course, and organization_learner_participations linked to combined Course but not passages', async function () {
    //given
    const { userId } = databaseBuilder.factory.buildMembership({
      organizationId: organization.id,
      organizationRole: Membership.roles.ADMIN,
    });

    campaignsApiStub.get.withArgs(campaign.id).resolves(campaign);
    campaignsApiStub.deleteCampaignsInCombinedCourses.withArgs(campaign.id).resolves();

    await databaseBuilder.commit();

    //when
    await usecases.deleteAndAnonymizeCombinedCourses({
      combinedCourseIds: [combinedCourse.id],
      userId,
      campaignsApi: campaignsApiStub,
    });

    const deletedCombinedCourses = await knex('combined_courses').where('id', combinedCourse.id);
    const deletedCombinedCourseParticipations = await knex('organization_learner_participations')
      .where('referenceId', combinedCourse.id)
      .where('type', OrganizationLearnerParticipationTypes.COMBINED_COURSE);

    const remainingCombinedCourses = await knex('combined_courses').where('id', otherCombinedCourse.id);
    const remainingCombinedCourseParticipations = await knex('organization_learner_participations')
      .where('referenceId', otherCombinedCourse.id)
      .where('type', OrganizationLearnerParticipationTypes.COMBINED_COURSE);

    const remainingPassages = await knex('organization_learner_participations')
      .where('referenceId', moduleId)
      .where('type', OrganizationLearnerParticipationTypes.PASSAGE);

    //then
    expect(deletedCombinedCourses[0].deletedBy).to.equal(userId);
    expect(deletedCombinedCourses[0].deletedAt).to.not.be.null;
    expect(deletedCombinedCourseParticipations[0].deletedBy).to.equal(userId);
    expect(deletedCombinedCourseParticipations[0].deletedAt).to.not.be.null;

    expect(remainingCombinedCourses[0].deletedAt).to.be.null;
    expect(remainingCombinedCourses[0].deletedBy).to.be.null;
    expect(remainingCombinedCourseParticipations[0].deletedAt).to.be.null;
    expect(remainingCombinedCourseParticipations[0].deletedBy).to.be.null;

    expect(remainingPassages[0].deletedAt).to.be.null;
    expect(remainingPassages[0].deletedBy).to.be.null;
  });
});
