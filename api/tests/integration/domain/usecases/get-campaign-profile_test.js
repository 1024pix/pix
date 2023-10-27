import { expect, databaseBuilder, mockLearningContent } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
const { FRENCH_SPOKEN } = LOCALE;

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
    const profile = await usecases.getCampaignProfile({
      userId,
      campaignId,
      campaignParticipationId,
      locale,
    });

    // then
    expect(profile.externalId).to.equal('BabaYaga');
  });
});
