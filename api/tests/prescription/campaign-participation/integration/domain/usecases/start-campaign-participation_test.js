import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCases | startCampaignParticipation', function () {
  it('start a new participation', async function () {
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' });
    const { id: userId } = databaseBuilder.factory.buildUser();
    databaseBuilder.factory.learningContent.build({ skills: [] });
    await databaseBuilder.commit();
    const campaignParticipation = { campaignId };

    const { campaignParticipation: startedParticipation } = await DomainTransaction.execute(() => {
      return usecases.startCampaignParticipation({
        userId,
        campaignParticipation,
      });
    });

    expect(startedParticipation).to.deep.include({ userId, campaignId, status: 'STARTED' });
  });
});
