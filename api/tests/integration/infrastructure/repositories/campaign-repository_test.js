const { expect, knex, factory } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign', () => {

  describe('#isCodeAvailable', () => {

    beforeEach(() => {
      const campaignToInsert = {
        name: 'Nom de Campagne',
        code: 'BADOIT710',
        createdAt: '2018-02-06 14:12:44',
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

  describe('#getByCode', () => {

    let campaignInsered;
    beforeEach(() => {
      campaignInsered = {
        id: 3,
        name: 'Nom de Campagne',
        code: 'BADOIT710',
        creatorId: 1,
        organizationId: 1
      };
      return knex('campaigns').insert(campaignInsered);
    });

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should resolve the campaign relies to the code', () => {
      // when
      const promise = campaignRepository.getByCode('BADOIT710');

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(campaignInsered);
      });
    });

    it('should resolve null if the code do not correspond to any campaign ', () => {
      // when
      const promise = campaignRepository.getByCode('BIDULEFAUX');

      // then
      return promise.then((result) => {
        expect(result).to.be.null;
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

  describe('#findByOrganization', () => {

    const campaign1Organization1 = factory.buildCampaign({ id: 1, organizationId: 1 });
    const campaign2Organization1 = factory.buildCampaign({ id: 2, organizationId: 1 });
    const campaign1Organization2 = factory.buildCampaign({ id: 3, organizationId: 2 });

    beforeEach(() => {
      return knex('campaigns').insert([campaign1Organization1, campaign2Organization1, campaign1Organization2]);
    });

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should return the campaigns of the given organization id', () => {
      // given
      const organizationId = 1;

      // when
      const promise = campaignRepository.findByOrganization(organizationId);

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(2);

        expect(campaigns[0]).to.be.instanceof(Campaign);
        expect(campaigns[0].id).to.equal(campaign1Organization1.id);
        expect(campaigns[0].name).to.equal(campaign1Organization1.name);
        expect(campaigns[0].code).to.equal(campaign1Organization1.code);
        expect(campaigns[0].createdAt).to.exist;
        expect(campaigns[0].creatorId).to.equal(campaign1Organization1.creatorId);
        expect(campaigns[0].organizationId).to.equal(campaign1Organization1.organizationId);

        expect(campaigns[1].id).to.equal(campaign2Organization1.id);
      });
    });
  });
});
