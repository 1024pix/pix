import { expect, sinon, databaseBuilder, knex } from '../../test-helper';
import logger from '../../../lib/infrastructure/logger';
import { toggleIsForAbsoluteNoviceCampaignAttribute } from '../../../scripts/toggle-is-for-absolute-novice-campaign-attribute';

describe('Toggle isForAbsoluteNovice campaign attribute', function () {
  describe('#toggleIsForAbsoluteNoviceCampaignAttribute', function () {
    context('when campaign does not exist', function () {
      it('should log an error', async function () {
        // given
        sinon.stub(logger, 'error');

        // when
        await toggleIsForAbsoluteNoviceCampaignAttribute(1234);

        // then
        expect(logger.error).to.have.been.calledWith('Campaign not found for id 1234');
      });
    });

    context('when campaign exists', function () {
      context('when isForAbsoluteNovice is true', function () {
        it('should disable isForAbsoluteNovice', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ isForAbsoluteNovice: true });
          await databaseBuilder.commit();

          // when
          await toggleIsForAbsoluteNoviceCampaignAttribute(campaign.id);

          // then
          const updatedCampaign = await knex
            .select('isForAbsoluteNovice')
            .from('campaigns')
            .where({ id: campaign.id })
            .first();
          expect(updatedCampaign.isForAbsoluteNovice).to.be.false;
        });
      });

      context('when isForAbsoluteNovice is false', function () {
        it('should enable isForAbsoluteNovice', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({ isForAbsoluteNovice: false });
          await databaseBuilder.commit();

          // when
          await toggleIsForAbsoluteNoviceCampaignAttribute(campaign.id);

          // then
          const updatedCampaign = await knex
            .select('isForAbsoluteNovice')
            .from('campaigns')
            .where({ id: campaign.id })
            .first();
          expect(updatedCampaign.isForAbsoluteNovice).to.be.true;
        });
      });
    });
  });
});
