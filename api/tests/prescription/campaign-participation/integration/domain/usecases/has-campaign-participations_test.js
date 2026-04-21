import sinon from 'sinon';

import { hasCampaignParticipations } from '../../../../../../src/prescription/campaign-participation/domain/usecases/has-campaign-participations.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Prescription | Campaign participation | Usecase | Has campaign participations', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((fn) => {
      return fn({});
    });
  });

  context('when user has campaign participations', function () {
    it('returns true', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      await databaseBuilder.commit();

      // when
      const result = await hasCampaignParticipations({ userId, campaignParticipationRepository });

      // then
      expect(result).to.be.true;
    });
  });

  context('when user has not campaign participations', function () {
    it('returns false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const user2Id = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId: user2Id, campaignId });
      await databaseBuilder.commit();

      // when
      const result = await hasCampaignParticipations({ userId, campaignParticipationRepository });

      // then
      expect(result).to.be.false;
    });
  });
});
