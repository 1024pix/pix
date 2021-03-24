const _ = require('lodash');
const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const poleEmploiSendingRepository = require('../../../../lib/infrastructure/repositories/pole-emploi-sending-repository');

describe('Integration | Repository | PoleEmploiSending', function() {

  describe('#create', function() {

    afterEach(function() {
      return knex('pole-emploi-sendings').delete();
    });

    it('should save PoleEmploiSending', async function() {
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
});
