const _ = require('lodash');
const { expect, databaseBuilder } = require('../../../test-helper');
const { fetchPage } = require('../../../../lib/infrastructure/utils/knex-utils');
const { knex } = require('../../../../lib/infrastructure/bookshelf');

describe('Integration | Infrastructure | Utils | Knex utils', function() {
  describe('fetchPage', function() {

    beforeEach(() => {
      _.times(20, (index) => databaseBuilder.factory.buildCampaign({ name: `campagne-${index}` }));
      return databaseBuilder.commit();
    });

    it('should fetch the given page and return results and pagination data', async function() {
      // when
      const query = knex.select('name').from('campaigns').orderBy('name');
      const { results, pagination } = await fetchPage(query, { number: 2, size: 5 });

      // then
      expect(results).to.have.lengthOf(5);
      expect(results[0].name).to.equal('campagne-13');
      expect(pagination).to.deep.equal({
        page: 2,
        pageSize: 5,
        rowCount: 20,
        pageCount: 4,
      });
    });
  });
});
