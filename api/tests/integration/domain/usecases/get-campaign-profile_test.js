const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | UseCase | get-campaign-profile', () => {
  const locale = FRENCH_SPOKEN;
  beforeEach(() => {
    mockLearningContent({ competences: [], areas: [], skills: [] });
  });

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
      campaignParticipationId,
      locale,
    });

    // then
    expect(profile.externalId).to.equal('BabaYaga');
  });
});

