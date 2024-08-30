import { fillCampaignIdInPartipations } from '../../../../scripts/prod/re-assign-campaign-participations-with-campaign.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Script | Prod | Re Assign Campaign Participations With Campaign', function () {
  describe('#fillCampaignIdInPartipations', function () {
    it('fill campaignId for given campaignParticipations and campaignId couple informations', async function () {
      const firstCampaignParticipationWithEmptyCampaignId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: null,
      });
      const secondCampaignParticipationWithEmptyCampaignId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: null,
      });
      const firstCampaign = databaseBuilder.factory.buildCampaign();
      const secondCampaign = databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      /*
      Le format dans le fichier json qu'on utilisera pour mettre a jour les campaign-participations avec les bons campaignId sera :
      {
        "campaignParticipationId" : campaignId
      }
      on le reproduit ici sous forme d'objet JS
      */
      const datasToUpdate = {
        [firstCampaignParticipationWithEmptyCampaignId.id]: firstCampaign.id,
        [secondCampaignParticipationWithEmptyCampaignId.id]: secondCampaign.id,
      };

      await fillCampaignIdInPartipations(datasToUpdate);

      const participationResults = await knex('campaign-participations').whereIn('id', [
        firstCampaignParticipationWithEmptyCampaignId.id,
        secondCampaignParticipationWithEmptyCampaignId.id,
      ]);

      const firstParticipationUpdated = participationResults.find(
        (cp) => cp.id === firstCampaignParticipationWithEmptyCampaignId.id,
      );
      const secondParticipationUpdated = participationResults.find(
        (cp) => cp.id === secondCampaignParticipationWithEmptyCampaignId.id,
      );

      expect(firstParticipationUpdated.campaignId).to.equal(firstCampaign.id);
      expect(secondParticipationUpdated.campaignId).to.equal(secondCampaign.id);
    });

    it('not fill campaignId for others campaignParticipations', async function () {
      const campaignParticipationWithEmptyCampaignId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: null,
      });
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipationWithCampaignId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });
      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      const datasToUpdate = {
        [campaignParticipationWithEmptyCampaignId.id]: otherCampaignId,
      };

      await fillCampaignIdInPartipations(datasToUpdate);

      const participationResultNotUpdated = await knex('campaign-participations')
        .where({
          id: campaignParticipationWithCampaignId.id,
        })
        .first();

      expect(participationResultNotUpdated.campaignId).to.equal(campaignId);
    });

    it('not update campaignId, if campaignParticipation already have campaignId filled', async function () {
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const campaignParticipationWithCampaignId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
      });
      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      const datasToUpdate = {
        [campaignParticipationWithCampaignId.id]: otherCampaignId,
      };

      await fillCampaignIdInPartipations(datasToUpdate);

      const participationResult = await knex('campaign-participations')
        .where({
          id: campaignParticipationWithCampaignId.id,
        })
        .first();

      expect(participationResult.campaignId).to.equal(campaignId);
    });
  });
});
