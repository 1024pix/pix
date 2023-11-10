import { expect, databaseBuilder, mockLearningContent } from '../../../test-helper.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Integration | UseCases | startCampaignParticipation', function () {
  it('start a new participation', async function () {
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', idPixLabel: null });
    const { id: userId } = databaseBuilder.factory.buildUser();
    mockLearningContent({
      skills: [],
    });
    await databaseBuilder.commit();
    const campaignParticipation = { campaignId };

    const { campaignParticipation: startedParticipation } = await DomainTransaction.execute((domainTransaction) => {
      return usecases.startCampaignParticipation({
        userId,
        campaignParticipation,
        domainTransaction,
      });
    });

    expect(startedParticipation).to.deep.include({ userId, campaignId, status: 'TO_SHARE' });
  });
});
