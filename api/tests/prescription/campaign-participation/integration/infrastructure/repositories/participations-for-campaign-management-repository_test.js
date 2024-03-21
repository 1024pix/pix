import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import * as participationsForCampaignManagementRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/participations-for-campaign-management-repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Participations-For-Campaign-Management', function () {
  describe('#updateParticipantExternalId', function () {
    context('When campaign participation is not null', function () {
      it('should update  ', async function () {
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
        const newParticipantExternalId = 'newExternal';
        await databaseBuilder.commit();

        await participationsForCampaignManagementRepository.updateParticipantExternalId({
          campaignParticipationId,
          participantExternalId: newParticipantExternalId,
        });
        const { participantExternalId } = await knex('campaign-participations')
          .select('*')
          .where('id', campaignParticipationId)
          .first();

        // then
        expect(participantExternalId).to.equal(newParticipantExternalId);
      });
    });

    context('When campaign participation is null', function () {
      it('should update  ', async function () {
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
        const newParticipantExternalId = null;
        await databaseBuilder.commit();

        await participationsForCampaignManagementRepository.updateParticipantExternalId({
          campaignParticipationId,
          participantExternalId: newParticipantExternalId,
        });
        const { participantExternalId } = await knex('campaign-participations')
          .select('*')
          .where('id', campaignParticipationId)
          .first();

        // then
        expect(participantExternalId).to.equal(null);
      });
    });

    context('campaign participation does not exist', function () {
      it('should throw an error', async function () {
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        await databaseBuilder.commit();

        const unexistingCampaignParticipationId = 90;
        const newParticipantExternalId = 'newExternal';

        const error = await catchErr(participationsForCampaignManagementRepository.updateParticipantExternalId)({
          campaignParticipationId: unexistingCampaignParticipationId,
          participantExternalId: newParticipantExternalId,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
