import _ from 'lodash';
import { expect, databaseBuilder, knex, domainBuilder } from '../../../test-helper';
import poleEmploiSendingRepository from '../../../../lib/infrastructure/repositories/pole-emploi-sending-repository';
import settings from '../../../../lib/config';
const poleEmploiSendingFactory = databaseBuilder.factory.poleEmploiSendingFactory;

describe('Integration | Repository | PoleEmploiSending', function () {
  describe('#create', function () {
    afterEach(function () {
      return knex('pole-emploi-sendings').delete();
    });

    it('should save PoleEmploiSending', async function () {
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

  describe('#find', function () {
    let originalEnvPoleEmploiSendingsLimit;
    let sending1;
    let sending2;
    let sending3;

    beforeEach(async function () {
      originalEnvPoleEmploiSendingsLimit = settings.poleEmploi.poleEmploiSendingsLimit;
      settings.poleEmploi.poleEmploiSendingsLimit = 3;
    });

    afterEach(function () {
      settings.poleEmploi.poleEmploiSendingsLimit = originalEnvPoleEmploiSendingsLimit;
    });

    it('should render sendings with idPoleEmploi inside the object', async function () {
      poleEmploiSendingFactory.buildWithUser({}, 'externalUserId1');
      await databaseBuilder.commit();

      const [sending] = await poleEmploiSendingRepository.find();

      expect(sending.resultat.individu.idPoleEmploi).to.equal('externalUserId1');
    });

    it('should render existing sendings using poleEmploiSendingsLimit', async function () {
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();
      poleEmploiSendingFactory.buildWithUser();

      await databaseBuilder.commit();

      const sendings = await poleEmploiSendingRepository.find();

      expect(sendings).to.have.lengthOf(3);
    });

    context('when there is a cursor', function () {
      let expectedSending;
      let sendingInCursor;

      beforeEach(async function () {
        expectedSending = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-03-01' });
        sendingInCursor = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-04-01' });

        await databaseBuilder.commit();
      });

      it('should return sendings where the date is before de given date', async function () {
        const { id: idEnvoi, createdAt: dateEnvoi } = sendingInCursor;

        const [sending] = await poleEmploiSendingRepository.find({ idEnvoi, dateEnvoi });

        expect(sending.idEnvoi).to.equal(expectedSending.id);
      });
    });

    context('when the participant has several authentication method', function () {
      it('should render only one sending', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId,
          identityProvider: 'PIX',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          userId,
          externalIdentifier: 'idPoleEmploi',
        });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ userId });
        poleEmploiSendingFactory.build({ campaignParticipationId });

        await databaseBuilder.commit();

        const sendings = await poleEmploiSendingRepository.find();

        expect(sendings.length).to.be.equal(1);
        expect(sendings[0].resultat.individu.idPoleEmploi).to.be.equal('idPoleEmploi');
      });
    });

    context('order', function () {
      beforeEach(async function () {
        sending1 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-03-01' });
        sending2 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-04-01' });
        sending3 = poleEmploiSendingFactory.buildWithUser({ createdAt: '2021-05-01' });

        await databaseBuilder.commit();
      });

      it('should render sendings order by date', async function () {
        const sendings = await poleEmploiSendingRepository.find();

        expect(sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending3.id, sending2.id, sending1.id]);
      });
    });

    context('when there is a filter on isSucccessful', function () {
      let sendingSent;
      let sendingNotSent;

      beforeEach(async function () {
        sendingSent = poleEmploiSendingFactory.buildWithUser({ isSuccessful: true });
        sendingNotSent = poleEmploiSendingFactory.buildWithUser({ isSuccessful: false });

        await databaseBuilder.commit();
      });

      it('returns the sendings which have been sent correctly', async function () {
        const sendings = await poleEmploiSendingRepository.find(null, { isSuccessful: true });
        const sendingIds = sendings.map((sending) => sending.idEnvoi);
        expect(sendingIds).to.exactlyContain([sendingSent.id]);
      });

      it('returns the sendings which have been not sent correctly', async function () {
        const sendings = await poleEmploiSendingRepository.find(null, { isSuccessful: false });
        const sendingIds = sendings.map((sending) => sending.idEnvoi);
        expect(sendingIds).to.exactlyContain([sendingNotSent.id]);
      });
    });
  });
});
