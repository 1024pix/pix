import { expect, databaseBuilder, knex, mockLearningContent } from '../../../test-helper';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';
import usecases from '../../../../lib/domain/usecases/';

describe('Integration | UseCases | startCampaignParticipation', function () {
  afterEach(async function () {
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
    await knex('organization-learners').delete();
  });

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
