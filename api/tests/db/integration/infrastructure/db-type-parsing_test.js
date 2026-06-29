import { expect } from '../../../test-helper.js';
import { datamartKnex, datawarehouseKnex, knex } from '../../../tooling/databases.js';

describe('Integration | DB | db-type-parsing', function () {
  describe('JSON and JSONB parsing', function () {
    [
      { knexClient: datamartKnex, name: 'datamartKnex' },
      { knexClient: datawarehouseKnex, name: 'datawarehouseKnex' },
      { knexClient: knex, name: 'knex' },
    ].forEach(({ knexClient, name }) => {
      beforeEach(async function () {
        await knexClient.raw(`
          CREATE TABLE db_type_parsing_test (
            id SERIAL PRIMARY KEY,
            column_of_type_json JSON NOT NULL,
            column_of_type_jsonb JSONB NOT NULL
          );
        `);
        await knexClient('db_type_parsing_test').insert({
          column_of_type_json: '[{"foo": "bar"}]',
          column_of_type_jsonb: '[{"foob": "barb"}]',
        });
      });

      if (name === 'datawarehouseKnex') {
        it(`should not cast json and jsonb types when reading data from table in base ${name}`, async function () {
          const res = await knexClient
            .select(['column_of_type_json', 'column_of_type_jsonb'])
            .from('db_type_parsing_test')
            .first();

          expect(res.column_of_type_json).to.equal('[{"foo": "bar"}]');
          expect(res.column_of_type_jsonb).to.equal('[{"foob": "barb"}]');
        });
      } else {
        it(`should cast json and jsonb types when reading data from table ${name}`, async function () {
          const res = await knexClient
            .select(['column_of_type_json', 'column_of_type_jsonb'])
            .from('db_type_parsing_test')
            .first();

          expect(res.column_of_type_json).to.deep.equal([{ foo: 'bar' }]);
          expect(res.column_of_type_jsonb).to.deep.equal([{ foob: 'barb' }]);
        });
      }

      afterEach(async function () {
        await knexClient.raw(`DROP TABLE IF EXISTS db_type_parsing_test;`);
      });
    });
  });
});
