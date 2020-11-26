const _ = require('lodash');
const { expect, databaseBuilder } = require('../../../test-helper');
const { fetchPage, DEFAULT_PAGINATION } = require('../../../../lib/infrastructure/utils/knex-utils');
const { knex } = require('../../../../lib/infrastructure/bookshelf');

describe('Integration | Infrastructure | Utils | Knex utils', () => {

  describe('fetchPage', () => {

    it('should fetch the given page and return results and pagination data', async () => {
      // given
      const letterA = 'a'.charCodeAt(0);
      _.times(26, (index) => databaseBuilder.factory.buildCampaign({ name: `${String.fromCharCode(letterA + index)}` }));
      await databaseBuilder.commit();

      // when
      const query = knex.select('name').from('campaigns').orderBy('name', 'ASC');
      const { results, pagination } = await fetchPage(query, { number: 2, size: 5 });

      // then
      expect(results).to.have.lengthOf(5);
      expect(results.map((result) => result.name)).exactlyContainInOrder(['f', 'g', 'h', 'i', 'j']);
      expect(pagination).to.deep.equal({
        page: 2,
        pageSize: 5,
        rowCount: 26,
        pageCount: 6,
      });
    });

    it('should correctly count rowCount with a distinct in the select clause', async () => {
      // given
      databaseBuilder.factory.buildCampaign({ name: 'DoublonA' });
      databaseBuilder.factory.buildCampaign({ name: 'DoublonA' });
      databaseBuilder.factory.buildCampaign({ name: 'DoublonB' });
      databaseBuilder.factory.buildCampaign({ name: 'DoublonB' });
      await databaseBuilder.commit();

      // when
      const query = knex.distinct('name').from('campaigns');
      const { results, pagination } = await fetchPage(query);

      // then
      expect(results).to.have.lengthOf(2);
      expect(results.map((result) => result.name)).exactlyContain(['DoublonA', 'DoublonB']);
      expect(pagination.rowCount).to.equal(2);
    });

    context('#pagination.page', () => {
      it('should return the requested page when there are results', async () => {
        // given
        const pageNumber = 5;
        const pageSize = 1;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(pageNumber);
      });

      it('should return the requested page even when there are no results', async () => {
        // given
        const pageNumber = 10000;
        const pageSize = 1;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.be.empty;
        expect(pagination.page).to.equal(pageNumber);
      });

      it('should return the page 1 when requesting for page 1 or lower', async () => {
        // given
        const pageNumber = 0;
        const pageSize = 1;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(1);
      });

      it('should return the DEFAULT_PAGINATION.PAGE when not indicating the page', async () => {
        // given
        const pageSize = 1;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(DEFAULT_PAGINATION.PAGE);
      });
    });

    context('#pagination.pageSize', () => {
      it('should return the requested pageSize when there are results', async () => {
        // given
        const pageNumber = 1;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.have.length(pageSize);
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the requested page even when there less results than expected', async () => {
        // given
        const pageNumber = 1;
        const total = 50;
        const pageSize = total + 3;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.have.length(total);
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the requested page even when there are no results', async () => {
        // given
        const pageNumber = 1000;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.be.empty;
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the DEFAULT_PAGINATION.PAGE_SIZE when not indicating the size', async () => {
        // given
        const pageNumber = 1;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber });

        // then
        expect(results).to.have.length(pagination.pageSize);
        expect(pagination.pageSize).to.equal(DEFAULT_PAGINATION.PAGE_SIZE);
      });
    });

    context('#pagination.rowCount', () => {
      it('should return the rowCount for the whole query when pagination has results', async () => {
        // given
        const pageNumber = 1;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.rowCount).to.equal(total);
      });

      it('should return the rowCount for the whole query even if there are no results with requested pagination', async () => {
        // given
        const pageNumber = 100000;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.be.empty;
        expect(pagination.rowCount).to.equal(total);
      });
    });

    context('#pagination.pageCount', () => {
      it('should return the pageCount according to the total row count for the whole query according to the requested page size', async () => {
        // given
        const pageNumber = 1;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.pageCount).to.equal(10);
      });

      it('should return the pageCount even when the last page would be partially filled', async () => {
        // given
        const pageNumber = 1;
        const pageSize = 6;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.pageCount).to.equal(9);
      });

      it('should return the pageCount even if there are no results with requested pagination', async () => {
        // given
        const pageNumber = 100000;
        const pageSize = 5;
        const total = 50;
        _.times(total, (index) => databaseBuilder.factory.buildCampaign({ name: `c-${index}` }));
        await databaseBuilder.commit();

        // when
        const query = knex.select('name').from('campaigns');
        const { results, pagination } = await fetchPage(query, { number: pageNumber, size: pageSize });

        // then
        expect(results).to.be.empty;
        expect(pagination.pageCount).to.equal(10);
      });
    });
  });
});
