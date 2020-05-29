const { expect, sinon } = require('../../../test-helper');
const { fetchPage } = require('../../../../lib/infrastructure/utils/knex-utils');

describe('Unit | Utils | knex-utils', () => {
  describe('#fetchPage', () => {
    const queryBuilder = {
      select: () => queryBuilder,
      limit: () => queryBuilder,
      offset: () => Promise.resolve([]), 
    };
    
    beforeEach(() => {
      sinon.spy(queryBuilder, 'offset');
      sinon.spy(queryBuilder, 'limit');
    });

    it('should fetch page with default page number and size', async () => {
      await fetchPage(queryBuilder);
      expect(queryBuilder.limit).to.be.calledWith(10);
      expect(queryBuilder.offset).to.be.calledWith(0);
    });

    it('should fetch page with given page number and size', async () => {
      await fetchPage(queryBuilder, { number: 2, size: 30 });
      expect(queryBuilder.limit).to.be.calledWith(30);
      expect(queryBuilder.offset).to.be.calledWith(30);
    });

    it('should return results and pagination info when no row returned', async () => {
      const { results, pagination } = await fetchPage(queryBuilder);
      expect(results).to.deep.equal([]);
      expect(pagination).to.deep.equal({
        page: 1,
        pageSize: 10,
        rowCount: 0,
        pageCount: 0,
      });
    });

    it('should return results and pagination info when some rows returned', async () => {
      const rows = [
        { value: '1', rowCount: 3 },
        { value: '2', rowCount: 3 },
        { value: '3', rowCount: 3 }
      ];
      queryBuilder.offset = () => Promise.resolve(rows);
      
      const { results, pagination } = await fetchPage(queryBuilder);
      expect(results).to.deep.equal(rows);
      expect(pagination).to.deep.equal({
        page: 1,
        pageSize: 10,
        rowCount: 3,
        pageCount: 1,
      });
    });
  });
});
