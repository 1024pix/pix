const { expect, knex } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign', () => {

  describe('#isCodeAvailable', () => {

    beforeEach(() => {
      const campaignToInsert = {
        name: 'Nom de Campagne',
        code: 'BADOIT710',
        creatorId: 1,
        organizationId: 1
      };
      return knex('campaigns').insert(campaignToInsert);
    });

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should resolve true if the code is available', () => {
      // when
      const promise = campaignRepository.isCodeAvailable('FRANCE998');

      // then
      return promise.then((result) => {
        expect(result).to.be.true;
      });
    });

    it('should resolve false if the code is available', () => {
      // when
      const promise = campaignRepository.isCodeAvailable('BADOIT710');

      // then
      return promise.then((result) => {
        expect(result).to.be.false;
      });
    });

  });

  describe('#save', () => {

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should save the given campaign', () => {
      // given
      const campaignToSave = new Campaign({
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        creatorId: 6,
        organizationId: 44,
      });

      // when
      const promise = campaignRepository.save(campaignToSave);

      // then
      return promise.then((savedCampaign) => {
        expect(savedCampaign).to.be.instanceof(Campaign);
        expect(savedCampaign.id).to.exist;
        expect(savedCampaign.name).to.equal(campaignToSave.name);
        expect(savedCampaign.code).to.equal(campaignToSave.code);
        expect(savedCampaign.creatorId).to.equal(campaignToSave.creatorId);
        expect(savedCampaign.organizationId).to.equal(campaignToSave.organizationId);
      });
    });

  });

});
