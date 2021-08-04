const { expect, databaseBuilder, domainBuilder, knex } = require('../../../test-helper');
const { startCampaignParticipationTrx } = require('../../../../lib/domain/usecases/index');

describe('Integration | UseCase | ', () => {
  afterEach(async () => {
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  context('when the use has access to the campaign', () => {
    it('returns the participants division', async () => {
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: false }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({organizationId}).id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: 'ASSESSMENT',
        creatorId: userId,
        organizationId,
        targetProfileId
      }).id;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      await startCampaignParticipationTrx({ campaignParticipation, userId });

      const campaignParticipations = await knex('campaign-participations');
      expect(campaignParticipations).to.have.lengthOf(1);
      const assessments = await knex('assessments').where({ userId });
      expect(assessments).to.have.lengthOf(1);
    });
  });
});
