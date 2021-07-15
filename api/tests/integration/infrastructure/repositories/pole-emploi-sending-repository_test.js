const _ = require('lodash');
const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const poleEmploiSendingRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const settings = require('../../../../lib/config');
const poleEmploiSendingFactory = databaseBuilder.factory.poleEmploiSendingFactory;

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

  describe('#find', () => {
    let originalEnvPoleEmploiSendingsLimit;
    let sending1;
    let sending2;
    let sending3;

    beforeEach(async () => {
      originalEnvPoleEmploiSendingsLimit = settings.poleEmploi.poleEmploiSendingsLimit;
      settings.poleEmploi.poleEmploiSendingsLimit = 3;
    });

    afterEach(() => {
      settings.poleEmploi.poleEmploiSendingsLimit = originalEnvPoleEmploiSendingsLimit;
    });

    it('should render sendings with idPoleEmploi inside the object', async () => {
      poleEmploiSendingFactory.buildWithUser({}, 'externalUserId1');
      await databaseBuilder.commit();

      const [sending] = await poleEmploiSendingRepository.find();

      expect(sending.resultat.individu.idPoleEmploi).to.equal('externalUserId1');
    });

    it('should render existing sendings using poleEmploiSendingsLimit', async () => {
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();

      await databaseBuilder.commit();

      const sendings = await poleEmploiSendingRepository.find();

      expect(sendings).to.have.lengthOf(3);
    });

    context('when there is a cursor', () => {
      let expectedSending;
      let sendingInCursor;

      beforeEach(async () => {
        expectedSending = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-03-01' });
        sendingInCursor = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-04-01'});

        await databaseBuilder.commit();
      });

      it('should return sendings where the date is before de given date', async() => {
        const { id: idEnvoi, createdAt: dateEnvoi } = sendingInCursor;

        const [sending] = await poleEmploiSendingRepository.find({ idEnvoi, dateEnvoi });

        expect(sending.idEnvoi).to.equal(expectedSending.id);
      });
    });

    context('when the participant has several authentication method', () => {
      it('should render only one sending', async () => {
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod({ userId, identityProvider: 'PIX' });
        databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({ userId, externalIdentifier: 'idPoleEmploi' });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ userId });
        poleEmploiSendingFactory.build({ campaignParticipationId });

        await databaseBuilder.commit();

        const sendings = await poleEmploiSendingRepository.find();

        expect(sendings.length).to.be.equal(1);
        expect(sendings[0].resultat.individu.idPoleEmploi).to.be.equal('idPoleEmploi');
      });
    });

    context('order', () => {
      beforeEach(async () => {
        sending1 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-03-01' });
        sending2 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-04-01' });
        sending3 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-05-01' });

        await databaseBuilder.commit();
      });

      it('should render sendings order by date', async () => {
        const sendings = await poleEmploiSendingRepository.find();

        expect(sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending3.id, sending2.id, sending1.id,]);
      });
    });
  });
});
