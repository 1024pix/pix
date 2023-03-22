const { expect, learningContentBuilder, mockLearningContent, databaseBuilder, knex } = require('../../../test-helper');
const {
  generateCampaignWithParticipants,
} = require('../../../../scripts/data-generation/generate-campaign-with-participants');

describe('Integration | Scripts | generate-campaign-with-participants', function () {
  it('should create a profiles collection campaign with participants', async function () {
    // given
    mockLearningContent(learningContentBuilder.buildLearningContent.fromAreas([]));
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
    databaseBuilder.factory.buildMembership({ organizationId, organizationRole: 'ADMIN', userId });
    await databaseBuilder.commit();
    // when
    await generateCampaignWithParticipants({
      organizationId,
      participantCount: 2,
      campaignType: 'profiles_collection',
    });

    // then
    const participants = await knex('campaign-participations');

    expect(participants.length).to.equal(2);
  });

  it('should create a assessment campaign with participants', async function () {
    // given
    mockLearningContent(learningContentBuilder.buildLearningContent.fromAreas([]));
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const userId = databaseBuilder.factory.buildUser({ id: 1 }).id;
    databaseBuilder.factory.buildMembership({ organizationId, organizationRole: 'ADMIN', userId });
    await databaseBuilder.commit();
    // when
    await generateCampaignWithParticipants({
      organizationId,
      participantCount: 2,
      campaignType: 'assessment',
    });

    // then
    const participants = await knex('campaign-participations');

    expect(participants.length).to.equal(2);
  });

  afterEach(async function () {
    await knex('answers').delete();
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
    await knex('organization-learners').delete();
    await knex('campaigns').delete();
    await knex('target-profiles').delete();
  });
});
