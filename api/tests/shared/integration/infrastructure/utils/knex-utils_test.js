import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import {
  batchUpdate,
  DEFAULT_PAGINATION,
  fetchPage,
} from '../../../../../src/shared/infrastructure/utils/knex-utils.js';
import { expect, knex } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Utils | Knex utils', function () {
  describe('fetchPage', function () {
    beforeEach(async function () {
      await knex.schema.dropTableIfExists('fetch_page_test');
      await knex.schema.createTable('fetch_page_test', (table) => {
        table.increments('id').primary();
        table.text('key');
      });
    });

    it('should fetch the given page and return results and pagination data', async function () {
      // given
      const letterA = 'a'.charCodeAt(0);
      const rows = Array.from({ length: 5 }, (_, index) => ({ key: String.fromCharCode(letterA + index) }));
      await knex('fetch_page_test').insert(rows);

      // when
      const query = knex.select('key').from('fetch_page_test').orderBy('key', 'ASC');
      const { results, pagination } = await fetchPage({
        queryBuilder: query,
        paginationParams: { number: 2, size: 2 },
      });

      // then
      expect(results).to.have.lengthOf(2);
      expect(results.map((result) => result.key)).exactlyContainInOrder(['c', 'd']);
      expect(pagination).to.deep.equal({
        page: 2,
        pageSize: 2,
        rowCount: 5,
        pageCount: 3,
      });
    });

    it('should correctly count rowCount with a distinct in the select clause', async function () {
      // given
      await knex('fetch_page_test').insert([
        { key: 'DoublonA' },
        { key: 'DoublonA' },
        { key: 'DoublonB' },
        { key: 'DoublonB' },
      ]);

      // when
      const query = knex.distinct('key').from('fetch_page_test');
      const { results, pagination } = await fetchPage({
        queryBuilder: query,
      });

      // then
      expect(results).to.have.lengthOf(2);
      expect(results.map((result) => result.key)).exactlyContain(['DoublonA', 'DoublonB']);
      expect(pagination.rowCount).to.equal(2);
    });

    context('#pagination.page', function () {
      it('should return the requested page when there are results', async function () {
        // given
        const pageNumber = 2;
        const pageSize = 1;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(pageNumber);
      });

      it('should return the requested page even when there are no results', async function () {
        // given
        const pageNumber = 10000;
        const pageSize = 1;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.be.empty;
        expect(pagination.page).to.equal(pageNumber);
      });

      it('should return the page 1 when requesting for page 1 or lower', async function () {
        // given
        const pageNumber = 0;
        const pageSize = 1;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(1);
      });

      it('should return the DEFAULT_PAGINATION.PAGE when not indicating the page', async function () {
        // given
        const pageSize = 1;
        const total = 1;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.page).to.equal(DEFAULT_PAGINATION.PAGE);
      });
    });

    context('#pagination.pageSize', function () {
      it('should return the requested pageSize when there are results', async function () {
        // given
        const pageNumber = 1;
        const pageSize = 2;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.have.lengthOf(pageSize);
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the requested page size even when there less results than expected', async function () {
        // given
        const pageNumber = 1;
        const total = 3;
        const pageSize = 6;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.have.lengthOf(total);
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the requested page size even when there are no results', async function () {
        // given
        const pageNumber = 1000;
        const pageSize = 5;
        const total = 1;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.be.empty;
        expect(pagination.pageSize).to.equal(pageSize);
      });

      it('should return the DEFAULT_PAGINATION.PAGE_SIZE when not indicating the size', async function () {
        // given
        const pageNumber = 1;
        const total = DEFAULT_PAGINATION.PAGE_SIZE + 1;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber },
        });

        // then
        expect(results).to.have.lengthOf(pagination.pageSize);
        expect(pagination.pageSize).to.equal(DEFAULT_PAGINATION.PAGE_SIZE);
      });
    });

    context('#pagination.rowCount', function () {
      it('should return the rowCount for the whole query when pagination has results', async function () {
        // given
        const pageNumber = 1;
        const pageSize = 3;
        const total = 5;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.rowCount).to.equal(total);
      });

      it('should return the rowCount for the whole query even if there are no results with requested pagination', async function () {
        // given
        const pageNumber = 100000;
        const pageSize = 2;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.be.empty;
        expect(pagination.rowCount).to.equal(total);
      });
    });

    context('#pagination.pageCount', function () {
      it('should return the pageCount according to the total row count for the whole query according to the requested page size', async function () {
        // given
        const pageNumber = 1;
        const pageSize = 2;
        const total = 10;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.pageCount).to.equal(5);
      });

      it('should return the pageCount even when the last page would be partially filled', async function () {
        // given
        const pageNumber = 1;
        const pageSize = 2;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.not.be.empty;
        expect(pagination.pageCount).to.equal(2);
      });

      it('should return the pageCount even if there are no results with requested pagination', async function () {
        // given
        const pageNumber = 100000;
        const pageSize = 2;
        const total = 3;
        const rows = Array.from({ length: total }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test');
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: pageNumber, size: pageSize },
        });

        // then
        expect(results).to.be.empty;
        expect(pagination.pageCount).to.equal(2);
      });
    });

    context('transaction compliant', function () {
      it('should use the transaction given in parameters', async function () {
        // given
        const rows = Array.from({ length: 10 }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);
        let hasReachedEndOfTest = false;
        try {
          await DomainTransaction.execute(async () => {
            // inserting rows within transaction
            const knexConn = DomainTransaction.getConnection();
            await knexConn('fetch_page_test').insert([
              { key: 'z_key1TRX' },
              { key: 'z_key2TRX' },
              { key: 'z_key3TRX' },
            ]);
            // inserting rows outside of the transaction
            await knex('fetch_page_test').insert([{ key: 'z_key1' }, { key: 'z_key2' }, { key: 'z_key3' }]);

            // when
            const { results: resultsInTrx, pagination: paginationInTrx } = await fetchPage({
              queryBuilder: knex.select('key').from('fetch_page_test').orderBy('key'),
              paginationParams: { number: 3, size: 5 },
            });
            expect(resultsInTrx, 'results within the transaction').to.deep.equal([
              { key: 'z_key1' },
              { key: 'z_key1TRX' },
              { key: 'z_key2' },
              { key: 'z_key2TRX' },
              { key: 'z_key3' },
            ]);
            expect(paginationInTrx).to.deep.equal({
              page: 3,
              pageSize: 5,
              rowCount: 16,
              pageCount: 4,
            });
            hasReachedEndOfTest = true;
            throw new Error('rollback');
          });
        } catch (err) {
          if (!hasReachedEndOfTest) {
            throw err;
          }
          // when
          const { results, pagination } = await fetchPage({
            queryBuilder: knex.select('key').from('fetch_page_test').orderBy('key'),
            paginationParams: { number: 3, size: 5 },
          });
          expect(results, 'results outside the rollbacked transaction').to.deep.equal([
            { key: 'z_key1' },
            { key: 'z_key2' },
            { key: 'z_key3' },
          ]);
          expect(pagination).to.deep.equal({
            page: 3,
            pageSize: 5,
            rowCount: 13,
            pageCount: 3,
          });
        }
      });
    });

    context('custom count query builder', function () {
      it('should use the custom query builder to count rows', async function () {
        // given
        const rows = Array.from({ length: 20 }, (_, index) => ({ key: `key-${index}` }));
        await knex('fetch_page_test').insert(rows);

        // when
        const query = knex.select('key').from('fetch_page_test').where('key', 'like', 'key-1%').orderBy('key');
        const countQuery = knex('fetch_page_test').count('*', { as: 'row_count' });
        const { results, pagination } = await fetchPage({
          queryBuilder: query,
          paginationParams: { number: 1, size: 5 },
          countQueryBuilder: countQuery,
        });

        // then
        expect(results).to.deep.equal([
          { key: 'key-1' },
          { key: 'key-10' },
          { key: 'key-11' },
          { key: 'key-12' },
          { key: 'key-13' },
        ]);
        expect(pagination).to.deep.equal({
          page: 1,
          pageSize: 5,
          rowCount: 20,
          pageCount: 4,
        });
      });
    });

    context('transaction + custom count query builder', function () {
      it('should use the transaction given in parameters also for the custom count query builder', async function () {
        // given
        const queryRows = Array.from({ length: 5 }, (_, index) => ({ key: `query-${index}` }));
        const countRows = Array.from({ length: 10 }, (_, index) => ({ key: `count-${index}` }));
        await knex('fetch_page_test').insert([...queryRows, ...countRows]);
        let hasReachedEndOfTest = false;
        try {
          await DomainTransaction.execute(async () => {
            // add rows within transaction
            const knexConn = DomainTransaction.getConnection();
            await knexConn('fetch_page_test').insert([{ key: 'z_query1TRX' }]);
            await knexConn('fetch_page_test').insert([{ key: 'count-TRX' }]);
            // add rows outside transaction
            await knex('fetch_page_test').insert([{ key: 'z_query1' }]);
            await knex('fetch_page_test').insert([
              { key: 'count-outside1' },
              { key: 'count-outside2' },
              { key: 'count-outside3' },
            ]);
            const queryInTrx = knex
              .select('key')
              .from('fetch_page_test')
              .where('key', 'like', 'query-%')
              .orWhere('key', 'like', 'z_query%')
              .orderBy('key');
            const countQueryBuilderInTrx = knex('fetch_page_test')
              .where('key', 'like', 'count-%')
              .count('*', { as: 'row_count' });
            const { results: resultsInTrx, pagination: paginationInTrx } = await fetchPage({
              queryBuilder: queryInTrx,
              paginationParams: { number: 2, size: 5 },
              countQueryBuilder: countQueryBuilderInTrx,
            });
            expect(resultsInTrx, 'results within the transaction for page 2').to.deep.equal([
              { key: 'z_query1' },
              { key: 'z_query1TRX' },
            ]);
            expect(paginationInTrx).to.deep.equal({
              page: 2,
              pageSize: 5,
              rowCount: 14, // count-0..9 + count-TRX + count-outside1..3
              pageCount: 3,
            });
            hasReachedEndOfTest = true;
            throw new Error('rollback');
          });
        } catch (err) {
          if (!hasReachedEndOfTest) {
            throw err;
          }
          const query = knex
            .select('key')
            .from('fetch_page_test')
            .where('key', 'like', 'query-%')
            .orWhere('key', 'like', 'z_query%')
            .orderBy('key');
          const countQuery = knex('fetch_page_test').where('key', 'like', 'count-%').count('*', { as: 'row_count' });
          const { results, pagination } = await fetchPage({
            queryBuilder: query,
            paginationParams: { number: 2, size: 5 },
            countQueryBuilder: countQuery,
          });
          expect(results, 'results outside the rollbacked transaction for page 2').to.deep.equal([{ key: 'z_query1' }]);
          expect(pagination).to.deep.equal({
            page: 2,
            pageSize: 5,
            rowCount: 13, // count-0..9 + count-outside1..3
            pageCount: 3,
          });
        }
      });
    });
  });

  describe('batchUpdate', function () {
    beforeEach(async function () {
      await knex.raw(`
        CREATE TYPE batch_status AS ENUM ('pending', 'running', 'done', 'failed');
      `);

      await knex.schema.createTable('batch_update_test', (table) => {
        table.integer('id').primary();
        table.string('string_type', 255);
        table.text('text_type');
        table.specificType('smallint_type', 'smallint');
        table.integer('integer_type');
        table.bigInteger('biginteger_type');
        table.specificType('numeric_type', 'numeric(12,4)');
        table.float('float_type');
        table.specificType('double_precision_type', 'double precision');
        table.boolean('boolean_type');
        table.timestamp('timestamp_type', { useTz: false });
        table.timestamp('timestamptz_type', { useTz: true });
        table.date('date_type');
        table.time('time_type');
        table.specificType('interval_type', 'interval');
        table.uuid('uuid_type');
        table.json('json_type');
        table.jsonb('jsonb_type');
        table.specificType('array_text_type', 'text[]');
        table.specificType('array_integer_type', 'integer[]');
        table.specificType('enum_type', 'batch_status');
        table.specificType('array_enum_type', 'batch_status[]');
        table.binary('binary_type');
      });
    });

    afterEach(async function () {
      await knex.schema.dropTableIfExists('batch_update_test');
      await knex.raw(`DROP TYPE IF EXISTS batch_status CASCADE`);
    });

    it('can update correctly for all types', async function () {
      // given
      const insertRows = [
        {
          id: 1,
          string_type: 'row1_string_type',
          text_type: 'row1_desc',
          smallint_type: 1,
          integer_type: 10,
          biginteger_type: 100,
          numeric_type: 1.1111,
          float_type: 1.1,
          double_precision_type: 1.11,
          boolean_type: true,
          timestamp_type: new Date('2024-01-01T01:00:00Z'),
          timestamptz_type: new Date('2024-01-01T01:00:00Z'),
          date_type: '1991-01-01',
          time_type: '06:00:00',
          interval_type: '1 hour',
          uuid_type: '11111111-1111-1111-1111-111111111111',
          json_type: { row: 1 },
          jsonb_type: { meta: 1 },
          array_text_type: ['r1a', 'r1b'],
          array_integer_type: [1, 2],
          enum_type: 'pending',
          array_enum_type: ['pending'],
          binary_type: Buffer.from('row1_raw'),
        },
        {
          id: 2,
          string_type: 'row2_string_type',
          text_type: 'row2_desc',
          smallint_type: 2,
          integer_type: 20,
          biginteger_type: 200,
          numeric_type: 2.2222,
          float_type: 2.2,
          double_precision_type: 2.22,
          boolean_type: false,
          timestamp_type: new Date('2024-02-02T02:00:00Z'),
          timestamptz_type: new Date('2024-02-02T02:00:00Z'),
          date_type: '1992-02-02',
          time_type: '07:00:00',
          interval_type: '2 hours',
          uuid_type: '22222222-2222-2222-2222-222222222222',
          json_type: { row: 2 },
          jsonb_type: { meta: 2 },
          array_text_type: ['r2a', 'r2b'],
          array_integer_type: [3, 4],
          enum_type: 'running',
          array_enum_type: ['running'],
          binary_type: Buffer.from('row2_raw'),
        },
        {
          id: 3,
          string_type: 'row3_string_type',
          text_type: 'row3_desc',
          smallint_type: 3,
          integer_type: 30,
          biginteger_type: 300,
          numeric_type: 3.3333,
          float_type: 3.3,
          double_precision_type: 3.33,
          boolean_type: true,
          timestamp_type: new Date('2024-03-03T03:00:00Z'),
          timestamptz_type: new Date('2024-03-03T03:00:00Z'),
          date_type: '1993-03-03',
          time_type: '08:00:00',
          interval_type: '3 hours',
          uuid_type: '33333333-3333-3333-3333-333333333333',
          json_type: { row: 3 },
          jsonb_type: { meta: 3 },
          array_text_type: ['r3a', 'r3b'],
          array_integer_type: [5, 6],
          enum_type: 'failed',
          array_enum_type: ['failed'],
          binary_type: Buffer.from('row3_raw'),
        },
      ];
      await knex('batch_update_test').insert(insertRows);

      // when
      await batchUpdate({
        tableName: 'batch_update_test',
        primaryKeyName: 'id',
        rows: [
          {
            id: 1,
            string_type: 'row1_new',
            text_type: 'row1_desc_new',
            smallint_type: 11,
            integer_type: 110,
            biginteger_type: 1100,
            numeric_type: 11.1111,
            float_type: 11.1,
            double_precision_type: 11.11,
            boolean_type: false,
            timestamp_type: new Date('2025-01-01T01:00:00Z'),
            timestamptz_type: new Date('2025-01-01T01:00:00Z'),
            date_type: '2001-01-01',
            time_type: '09:00:00',
            interval_type: '11 hours',
            uuid_type: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            json_type: { row: '1_updated' },
            jsonb_type: { meta: '1_updated' },
            array_text_type: ['r1_new'],
            array_integer_type: [10, 11],
            enum_type: 'done',
            array_enum_type: ['running', 'done'],
            binary_type: Buffer.from('row1_new_raw'),
          },
          {
            id: 2,
            string_type: null,
            text_type: null,
            smallint_type: null,
            integer_type: null,
            biginteger_type: null,
            numeric_type: undefined,
            float_type: null,
            double_precision_type: null,
            boolean_type: null,
            timestamp_type: null,
            timestamptz_type: null,
            date_type: null,
            time_type: null,
            interval_type: null,
            uuid_type: null,
            json_type: null,
            jsonb_type: null,
            array_text_type: null,
            array_integer_type: null,
            enum_type: null,
            array_enum_type: null,
            binary_type: null,
          },
        ],
      });

      // then
      const [r1, r2, r3] = await knex('batch_update_test').orderBy('id');
      expect(r1).to.deep.include({
        id: 1,
        string_type: 'row1_new',
        text_type: 'row1_desc_new',
        smallint_type: 11,
        integer_type: 110,
        biginteger_type: 1100,
        numeric_type: '11.1111',
        float_type: 11.1,
        double_precision_type: 11.11,
        boolean_type: false,
        uuid_type: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        json_type: { row: '1_updated' },
        jsonb_type: { meta: '1_updated' },
        array_text_type: ['r1_new'],
        array_integer_type: [10, 11],
        enum_type: 'done',
        array_enum_type: '{running,done}',
        binary_type: Buffer.from('row1_new_raw'),
      });

      expect(r2).to.deep.include({
        id: 2,
        string_type: null,
        text_type: null,
        smallint_type: null,
        integer_type: null,
        biginteger_type: null,
        numeric_type: null,
        float_type: null,
        double_precision_type: null,
        boolean_type: null,
        uuid_type: null,
        json_type: null,
        jsonb_type: null,
        array_text_type: null,
        array_integer_type: null,
        enum_type: null,
        array_enum_type: null,
        binary_type: null,
      });

      expect(r3).to.deep.include({
        id: 3,
        string_type: 'row3_string_type',
        text_type: 'row3_desc',
        smallint_type: 3,
        integer_type: 30,
        biginteger_type: 300,
        numeric_type: '3.3333',
        float_type: 3.3,
        double_precision_type: 3.33,
        boolean_type: true,
        uuid_type: '33333333-3333-3333-3333-333333333333',
        json_type: { row: 3 },
        jsonb_type: { meta: 3 },
        array_text_type: ['r3a', 'r3b'],
        array_integer_type: [5, 6],
        enum_type: 'failed',
        array_enum_type: '{failed}',
        binary_type: Buffer.from('row3_raw'),
      });
    });

    it('can partially update rows', async function () {
      // given
      const insertRows = [
        {
          id: 1,
          string_type: 'row1_original',
          integer_type: 10,
        },
        {
          id: 2,
          string_type: 'row2_original',
          integer_type: 20,
        },
        {
          id: 3,
          string_type: 'row3_original',
          integer_type: 30,
        },
      ];
      await knex('batch_update_test').insert(insertRows);

      // when
      await batchUpdate({
        tableName: 'batch_update_test',
        primaryKeyName: 'id',
        rows: [
          {
            id: 1,
            integer_type: 110,
          },
          {
            id: 2,
            integer_type: null,
          },
        ],
      });

      // then
      const [r1, r2, r3] = await knex('batch_update_test').orderBy('id');
      expect(r1).to.deep.include({
        id: 1,
        string_type: 'row1_original',
        text_type: null,
        integer_type: 110,
        smallint_type: null,
        biginteger_type: null,
        numeric_type: null,
        float_type: null,
        double_precision_type: null,
        boolean_type: null,
        uuid_type: null,
        json_type: null,
        jsonb_type: null,
        array_text_type: null,
        array_integer_type: null,
        enum_type: null,
        array_enum_type: null,
        binary_type: null,
      });

      expect(r2).to.deep.include({
        id: 2,
        string_type: 'row2_original',
        text_type: null,
        smallint_type: null,
        integer_type: null,
        biginteger_type: null,
        numeric_type: null,
        float_type: null,
        double_precision_type: null,
        boolean_type: null,
        uuid_type: null,
        json_type: null,
        jsonb_type: null,
        array_text_type: null,
        array_integer_type: null,
        enum_type: null,
        array_enum_type: null,
        binary_type: null,
      });

      expect(r3).to.deep.include({
        id: 3,
        string_type: 'row3_original',
        text_type: null,
        smallint_type: null,
        integer_type: 30,
        biginteger_type: null,
        numeric_type: null,
        float_type: null,
        double_precision_type: null,
        boolean_type: null,
        uuid_type: null,
        json_type: null,
        jsonb_type: null,
        array_text_type: null,
        array_integer_type: null,
        enum_type: null,
        array_enum_type: null,
        binary_type: null,
      });
    });

    it('does nothing when passing an empty array of rows', async function () {
      const insertRows = [
        {
          id: 1,
          string_type: 'row1_original',
        },
        {
          id: 2,
          string_type: 'row2_original',
        },
      ];
      await knex('batch_update_test').insert(insertRows);

      // when
      await batchUpdate({
        tableName: 'batch_update_test',
        primaryKeyName: 'id',
        rows: [],
      });

      // then
      const [r1, r2] = await knex('batch_update_test').orderBy('id');
      expect(r1).to.deep.include({
        id: 1,
        string_type: 'row1_original',
      });

      expect(r2).to.deep.include({
        id: 2,
        string_type: 'row2_original',
      });
    });

    it('should chunk updates', async function () {
      // given
      const total = 100;
      const rowsToInsert = [];
      const rowsToUpdate = [];
      for (let index = 0; index < total; index++) {
        rowsToInsert.push({
          id: index + 1,
          string_type: `row${index}-original`,
        });
        if (index % 2 === 0) {
          rowsToUpdate.push({
            id: index + 1,
            string_type: `row${index}-updated`,
          });
        }
      }
      await knex('batch_update_test').insert(rowsToInsert);
      let updateQueryCount = 0;
      function countUpdatesListener(query) {
        if (query.sql.startsWith('UPDATE "public"."batch_update_test"')) {
          updateQueryCount++;
        }
      }
      knex.on('query', countUpdatesListener);

      // when
      try {
        await batchUpdate({
          tableName: 'batch_update_test',
          primaryKeyName: 'id',
          rows: rowsToUpdate,
          chunkSize: 10,
        });
      } finally {
        knex.off('query', countUpdatesListener);
      }

      // then
      const countUpdated = await knex('batch_update_test').whereLike('string_type', '%-updated');
      expect(countUpdated.length).to.equal(50);
      expect(updateQueryCount).to.equal(5);
    });
  });
});
