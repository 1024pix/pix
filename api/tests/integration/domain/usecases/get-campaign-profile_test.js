const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases/index.js');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Integration | UseCase | get-campaign-profile', function () {
  const locale = FRENCH_SPOKEN;
  beforeEach(function () {
    mockLearningContent({ competences: [], areas: [], skills: [] });
  });

  it('should return the campaign profile', async function () {
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    const userId = databaseBuilder.factory.buildUser({ organizationId }).id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });

    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      participantExternalId: 'BabaYaga',
    }).id;

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
