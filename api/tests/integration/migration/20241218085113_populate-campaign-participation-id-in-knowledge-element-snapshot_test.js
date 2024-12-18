import { up as migrationToTest } from '../../../db/migrations/20241218085113_populate-campaign-participation-id-in-knowledge-element-snapshot.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../test-helper.js';

describe('Integration | Migration | populate-campaign-participation-id-in-knowledge-element-snapshot', function () {
  let campaign, user, learner, sharedAt1, sharedAt2, participation1, participation2;

  beforeEach(async function () {
    sharedAt1 = new Date('2021-09-02T10:00:00Z');
    sharedAt2 = new Date('2021-11-03T15:40:00Z');

    user = databaseBuilder.factory.buildUser();
    learner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      userId: user.id,
    });
    const user2 = databaseBuilder.factory.buildUser();
    const learner2 = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      userId: user2.id,
    });

    campaign = databaseBuilder.factory.buildCampaign();

    participation1 = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      organizationLearnerId: learner.id,
      userId: user.id,
      status: CampaignParticipationStatuses.SHARED,
      sharedAt: sharedAt1,
    });

    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      userId: user.id,
      snappedAt: sharedAt1,
    });

    participation2 = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      organizationLearnerId: learner2.id,
      userId: user2.id,
      status: CampaignParticipationStatuses.SHARED,
      sharedAt: sharedAt2,
    });
    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      userId: user2.id,
      snappedAt: sharedAt2,
    });

    await databaseBuilder.commit();
  });

  it('should populate campaignParticipationId with corresponding participation on knowledge-element-snapshots', async function () {
    //given
    const keSnapshots = await knex('knowledge-element-snapshots');
    expect(keSnapshots.every((snap) => snap.campaignParticipationId === null)).to.be.true;

    // when
    await migrationToTest(knex);

    // then
    let keSnapshot = await knex('knowledge-element-snapshots')
      .where({ userId: participation1.userId, snappedAt: participation1.sharedAt })
      .first();
    expect(keSnapshot.campaignParticipationId).to.equal(participation1.id);

    keSnapshot = await knex('knowledge-element-snapshots')
      .where({ userId: participation2.userId, snappedAt: participation2.sharedAt })
      .first();
    expect(keSnapshot.campaignParticipationId).to.equal(participation2.id);
  });

  it('should only populate knowledge-element-snapshots without campaignParticipationId', async function () {
    const participation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: campaign.id,
      organizationLearnerId: learner.id,
      userId: user.id,
      status: CampaignParticipationStatuses.SHARED,
      sharedAt: sharedAt1,
      isImproved: true,
    });
    await databaseBuilder.commit();
    //given
    await knex('knowledge-element-snapshots')
      .update({ campaignParticipationId: participation.id })
      .where({ userId: participation1.userId, snappedAt: participation1.sharedAt });

    // when
    await migrationToTest(knex);

    // then
    let keSnapshot = await knex('knowledge-element-snapshots')
      .where({ userId: participation1.userId, snappedAt: participation1.sharedAt })
      .first();
    expect(keSnapshot.campaignParticipationId).to.equal(participation.id);

    keSnapshot = await knex('knowledge-element-snapshots')
      .where({ userId: participation2.userId, snappedAt: participation2.sharedAt })
      .first();
    expect(keSnapshot.campaignParticipationId).to.equal(participation2.id);
  });

  describe('improved participation', function () {
    let sharedAtImproved, improvedParticipation;

    beforeEach(async function () {
      sharedAtImproved = new Date('2021-09-02T13:20:00Z');
      improvedParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: learner.id,
        userId: user.id,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt: sharedAtImproved,
        isImproved: true,
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: user.id,
        snappedAt: sharedAtImproved,
      });
      await databaseBuilder.commit();
    });

    it('should populate campaignParticipationId from improved participation', async function () {
      // when
      await migrationToTest(knex);

      // then
      let keSnapshot = await knex('knowledge-element-snapshots')
        .where({ userId: participation1.userId, snappedAt: participation1.sharedAt })
        .first();
      expect(keSnapshot.campaignParticipationId).to.equal(participation1.id);

      keSnapshot = await knex('knowledge-element-snapshots')
        .where({ userId: improvedParticipation.userId, snappedAt: improvedParticipation.sharedAt })
        .first();
      expect(keSnapshot.campaignParticipationId).to.equal(improvedParticipation.id);
    });
  });
});
