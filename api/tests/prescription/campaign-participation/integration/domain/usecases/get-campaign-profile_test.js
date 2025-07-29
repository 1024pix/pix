import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';

describe('Integration | UseCase | get-campaign-profile', function () {
  const locale = FRENCH_SPOKEN;

  beforeEach(async function () {
    await mockLearningContent({ competences: [], areas: [], skills: [] });
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
