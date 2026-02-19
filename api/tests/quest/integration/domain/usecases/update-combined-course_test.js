import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder, expect, knex, nock, sinon } from '../../../../test-helper.js';

describe('Integration | Quest | Domain | UseCases | update-combined-course', function () {
  let clock;
  const now = new Date('2025-07-07');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should synchronize and update combined course if it is completed', async function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    const code = 'SOMETHING';
    const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const trainingId = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' }).id;
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId });

    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      combinedCourseContents: [{ campaignId: campaign.id }, { moduleId }],
    });

    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      userId,
      organizationLearnerId,
      status: CampaignParticipationStatuses.SHARED,
    }).id;
    databaseBuilder.factory.buildUserRecommendedTraining({
      userId,
      trainingId: trainingId,
      campaignParticipationId,
    });

    // build terminated passages and started OrganizationLearnerParticipation Passages to validate right synchronization
    databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
    databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypePassage({
      organizationLearnerId,
      moduleId,
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });

    const combinedCourseParticipation =
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        organizationLearnerId,
        combinedCourseId,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourse({ userId, code });

    const result = await knex('organization_learner_participations')
      .where({ id: combinedCourseParticipation.id })
      .first();

    expect(result.status).to.equal(OrganizationLearnerParticipationStatuses.COMPLETED);
    expect(result.updatedAt).to.deep.equal(now);
  });

  it('should update organization learner participations when passage is on a recommended module', async function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    const code = 'SOMETHING';
    const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
    const module2Id = '9beb922f-4d8e-495d-9c85-0e7265ca78d6';
    const module3Id = 'd4c4a2b2-0046-471d-ad9c-15f9cfc8f1f6';

    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const trainingId = databaseBuilder.factory.buildTraining({ type: 'modulix', link: '/modules/bac-a-sable' }).id;
    const training2Id = databaseBuilder.factory.buildTraining({
      type: 'modulix',
      link: '/modules/au-dela-des-mots-de-passe',
    }).id;
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId });
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId: targetProfile.id, trainingId: training2Id });

    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      userId,
      organizationLearnerId,
      status: CampaignParticipationStatuses.SHARED,
    }).id;
    databaseBuilder.factory.buildUserRecommendedTraining({
      userId,
      trainingId: trainingId,
      campaignParticipationId,
    });
    databaseBuilder.factory.buildPassage({ userId, moduleId, terminatedAt: new Date() });
    databaseBuilder.factory.buildPassage({ userId, module2Id, terminatedAt: null });

    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      combinedCourseContents: [
        { campaignId: campaign.id },
        { moduleId },
        { moduleId: module2Id },
        { moduleId: module3Id },
      ],
    });
    databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
      organizationLearnerId,
      combinedCourseId,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
      status: OrganizationLearnerParticipationStatuses.STARTED,
    });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourse({ userId, code });

    // then
    const result = await knex('organization_learner_participations').where({
      organizationLearnerId,
      type: OrganizationLearnerParticipationTypes.PASSAGE,
    });

    expect(result).to.be.lengthOf(2);
    expect(result[0].referenceId).equal(moduleId);
    expect(result[1].referenceId).equal(module3Id);
  });
  it('should not update combined course if it not completed', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      combinedCourseContents: [{ campaignId: campaign.id }],
    });
    const combinedCourseParticipation =
      databaseBuilder.factory.buildOrganizationLearnerParticipation.ofTypeCombinedCourse({
        organizationLearnerId,
        combinedCourseId,
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date('2022-01-01'),
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourse({ userId, code });

    const result = await knex('organization_learner_participations')
      .where({ id: combinedCourseParticipation.id })
      .first();

    expect(result.status).to.equal(combinedCourseParticipation.status);
    expect(result.updatedAt).to.deep.equal(combinedCourseParticipation.updatedAt);
  });

  it('should not throw if combinedCourseParticipation does not exist', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      combinedCourseContents: [{ campaignId: campaign.id }],
    });
    await databaseBuilder.commit();

    const result = await usecases.updateCombinedCourse({ userId, code });

    const participation = await knex('organization_learner_participations').where({ organizationLearnerId }).first();
    expect(participation).to.be.undefined;
    expect(result).to.not.throw;
  });

  it('should not update combined course if it is already completed', async function () {
    const code = 'SOMETHING';
    const { id: organizationLearnerId, userId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
    const targetProfile = databaseBuilder.factory.buildTargetProfile();
    const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id, organizationId });

    const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
      code,
      organizationId,
      combinedCourseContents: [{ campaignId: campaign.id }],
    });
    const combinedCourseParticipation = databaseBuilder.factory.buildOrganizationLearnerParticipation({
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      organizationLearnerId,
      combinedCourseId,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
      status: OrganizationLearnerParticipationStatuses.COMPLETED,
    });
    await databaseBuilder.commit();

    await usecases.updateCombinedCourse({ userId, code });

    const result = await knex('organization_learner_participations')
      .where({ id: combinedCourseParticipation.id })
      .first();

    expect(result.status).to.equal(combinedCourseParticipation.status);
    expect(result.updatedAt).to.deep.equal(combinedCourseParticipation.updatedAt);
  });
});
