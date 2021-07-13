const { expect, databaseBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const poleEmploiService = require('../../../../lib/domain/services/pole-emploi-service');
const poleEmploiSendingRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const settings = require('../../../../lib/config');

describe('Integration | UseCase | get-campaign-participations-counts-by-stage', () => {
  let originalEnv;
  let sending1;
  let sending2;
  let campaignId;

  beforeEach(async() => {
    originalEnv = settings.apiManager.url;
    settings.apiManager.url = 'https://fake-url.fr';

    const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Pole emploi' }).id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

    const user1Id = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildAuthenticationMethod({ userId: user1Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId1' });
    const campaignParticipation1Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user1Id, campaignId }).id;
    sending1 = databaseBuilder.factory.buildPoleEmploiSending({ id: 8766, campaignParticipationId: campaignParticipation1Id, createdAt: new Date('2021-03-01'), payload: { individu: {} } });

    const user2Id = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildAuthenticationMethod({ userId: user2Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId2' });
    const campaignParticipation2Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user2Id, campaignId }).id;
    sending2 = databaseBuilder.factory.buildPoleEmploiSending({ id: 45678, campaignParticipationId: campaignParticipation2Id, createdAt: new Date('2021-04-01'), payload: { individu: {} } });

    await databaseBuilder.commit();

  });

  afterEach(() => {
    settings.apiManager.url = originalEnv;
  });

  context('when there is no cursor', function() {
    it('should return the most recent sendings', async () => {
      //given
      const cursor = null;

      //when
      const expectedLink = poleEmploiService.generateLink({ idEnvoi: sending1.id, dateEnvoi: sending1.createdAt });

      const response = await usecases.getPoleEmploiSendings({ cursor, poleEmploiSendingRepository });
      //then
      expect(response.sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending2.id, sending1.id]);
      expect(response.link).to.equal(expectedLink);
    });
  });

  context('when there is a cursor', function() {
    it('should return a sending with a link', async () => {
      //given
      const cursorCorrespondingToSending2 = poleEmploiService.generateCursor({ idEnvoi: sending2.id, dateEnvoi: sending2.createdAt });
      const expectedLink = poleEmploiService.generateLink({ idEnvoi: sending1.id, dateEnvoi: sending1.createdAt });

      //when
      const response = await usecases.getPoleEmploiSendings({ cursor: cursorCorrespondingToSending2, poleEmploiSendingRepository });
      //then
      expect(response.sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending1.id]);
      expect(response.link).to.equal(expectedLink);
    });
  });

  context('when there is a cursor but there is no more sending', function() {
    it('should return neither a sending nor a link', async () => {
      //given
      const cursorCorrespondingToSending1 = poleEmploiService.generateCursor({ idEnvoi: sending1.id, dateEnvoi: sending1.createdAt });

      //when
      const response = await usecases.getPoleEmploiSendings({ cursor: cursorCorrespondingToSending1, poleEmploiSendingRepository });

      //then
      expect(response.sendings).to.deep.equal([]);
      expect(response.link).to.equal(null);
    });
  });
});
