const { expect, knex } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');

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

});
