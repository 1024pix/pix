const { expect, databaseBuilder, airtableBuilder,  catchErr } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Integration | UseCase | get-campaign-profile', () => {
  beforeEach(() => {
    airtableBuilder.mockList({ tableName: 'Competences' }).returns([]).activate();
    airtableBuilder.mockList({ tableName: 'Domaines' }).returns([]).activate();
  });

  afterEach(async () => {
    airtableBuilder.cleanAll();
    cache.flushAll();
  });

  context('when requesting user is not allowed to access campaign', () => {

    it('should throw a UserNotAuthorizedToAccessEntity error', async () => {
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      const userId = databaseBuilder.factory.buildUser();

      // when
      const error = await catchErr(useCases.getCampaignProfile)({
        userId,
        campaignId,
        campaignParticipationId: 1
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      expect(error.message).to.equal('User does not belong to an organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign', () => {

    it('should return the campaign profile', async () => {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const userId = databaseBuilder.factory.buildUser({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, participantExternalId: 'BabaYaga' }).id;

      await databaseBuilder.commit();
      // when
      const profile = await useCases.getCampaignProfile({
        userId,
        campaignId,
        campaignParticipationId
      });

      // then
      expect(profile.externalId).to.equal('BabaYaga');
    });
  });
});

