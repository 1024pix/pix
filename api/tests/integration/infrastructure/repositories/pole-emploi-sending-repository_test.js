const _ = require('lodash');
const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const poleEmploiSendingRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const settings = require('../../../../lib/config');

describe('Integration | Repository | PoleEmploiSending', () => {

  describe('#create', () => {

    afterEach(() => {
      return knex('pole-emploi-sendings').delete();
    });

    it('should save PoleEmploiSending', async () => {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();
      const poleEmploiSending = domainBuilder.buildPoleEmploiSending({ campaignParticipationId });

      // when
      await poleEmploiSendingRepository.create({ poleEmploiSending });

      // then
      const poleEmploiSendings = await knex('pole-emploi-sendings').select();
      expect(poleEmploiSendings).to.have.lengthOf(1);
      expect(_.omit(poleEmploiSendings[0], ['id', 'createdAt'])).to.deep.equal(poleEmploiSending);
    });
  });

  describe('#get', () => {
    let originalEnvPoleEmploiSendingsLimit;
    let sending1;
    let sending2;
    let sending4;

    beforeEach(async () => {
      originalEnvPoleEmploiSendingsLimit = settings.poleEmploi.poleEmploiSendingsLimit;

      settings.poleEmploi.poleEmploiSendingsLimit = 3;
      settings.poleEmploi.poleEmploiIdentityProvider = 'POLE_EMPLOI';

      const organizationId = databaseBuilder.factory.buildOrganization({ name: 'Pole emploi' }).id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      const user1Id = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId: user1Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId1' });
      const campaignParticipation1Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user1Id, campaignId }).id;
      sending1 = databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId: campaignParticipation1Id, createdAt: new Date('2021-05-01'), payload: { individu: {} } });

      const user2Id = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId: user2Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId2' });
      const campaignParticipation2Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user2Id, campaignId }).id;
      sending2 = databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId: campaignParticipation2Id, createdAt: new Date('2021-04-01'), payload: { individu: {} } });

      const user3Id = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId: user3Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId3' });
      const campaignParticipation3Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user3Id, campaignId }).id;
      databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId: campaignParticipation3Id, createdAt: new Date('2021-03-01'), payload: { individu: {} } });

      const user4Id = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId: user4Id, identityProvider: 'POLE_EMPLOI', externalIdentifier: 'externalUserId4' });
      const campaignParticipation4Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user4Id, campaignId }).id;
      sending4 = databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId: campaignParticipation4Id, createdAt: new Date('2021-06-01'), payload: { individu: {} } });

      const user5Id = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildAuthenticationMethod({ userId: user5Id, identityProvider: 'PIX', externalIdentifier: 'externalUserId5' });
      const campaignParticipation5Id = databaseBuilder.factory.buildCampaignParticipation({ userId: user5Id, campaignId }).id;
      databaseBuilder.factory.buildPoleEmploiSending({ campaignParticipationId: campaignParticipation5Id, createdAt: new Date('2021-06-01'), payload: { individu: {} } });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      settings.poleEmploi.poleEmploiSendingsLimit = originalEnvPoleEmploiSendingsLimit;
    });

    it('should render 3 sendings because of the poleEmploiSendingsLimit variable', async () => {
      // when
      const sendings = await poleEmploiSendingRepository.get();

      // then
      expect(sendings).to.have.lengthOf(3);
    });

    it('should render sendings order by date', async () => {
      // when
      const sendings = await poleEmploiSendingRepository.get();

      // then
      expect(sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending4.id, sending1.id, sending2.id]);
    });

    it('should render sendings with idPoleEmploi inside the object', async () => {
      // when
      const sendings = await poleEmploiSendingRepository.get();

      // then
      expect(sendings.map((sending) => sending.resultat.individu.idPoleEmploi)).to.deep.equal(['externalUserId4', 'externalUserId1', 'externalUserId2']);
    });
  });
});
