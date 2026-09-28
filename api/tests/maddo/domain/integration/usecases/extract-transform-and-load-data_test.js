import { expect } from 'chai';

import { extractTransformAndLoadData } from '../../../../../src/maddo/domain/usecases/extract-transform-and-load-data.ts';
import { datamartKnex, datawarehouseKnex } from '../../../../tooling/databases.js';

describe('Maddo | Domain | Usecases | Integration | extract-transform-and-load-data', function () {
  const dropTables = async () => {
    await datawarehouseKnex.schema.dropTableIfExists('to-replicate');
    await datamartKnex.schema.dropTableIfExists('replication');
  };
  beforeEach(dropTables);
  afterEach(dropTables);

  it('should replace the target rows with the selected source columns', async function () {
    // given
    const schema = (t) => {
      t.string('firstName').notNullable();
      t.string('lastName').notNullable();
    };
    await datawarehouseKnex.schema.createTable('to-replicate', (t) => {
      schema(t);
      t.string('ignored');
    });
    await datamartKnex.schema.createTable('replication', schema);
    await datamartKnex('replication').insert([
      { firstName: 'oldfirst1', lastName: 'oldlast1' },
      { firstName: 'oldfirst2', lastName: 'oldlast2' },
    ]);
    await datawarehouseKnex('to-replicate').insert([
      { firstName: 'first1', lastName: 'last1', ignored: 'x' },
      { firstName: 'first2', lastName: 'last2', ignored: 'y' },
    ]);
    const replications = {
      'my-replication': { source: 'to-replicate', target: 'replication', columns: ['firstName', 'lastName'] },
    };

    // when
    const result = await extractTransformAndLoadData({
      replicationName: 'my-replication',
      replications,
      datamartKnex,
      datawarehouseKnex,
    });

    // then
    expect(result).to.deep.equal({ count: 2 });
    const replicatedData = await datamartKnex('replication').select().orderBy('firstName');
    expect(replicatedData).to.deep.equal([
      { firstName: 'first1', lastName: 'last1' },
      { firstName: 'first2', lastName: 'last2' },
    ]);
  });

  it('should rename columns given a { target: source } mapping', async function () {
    // given
    await datawarehouseKnex.schema.createTable('to-replicate', (t) => {
      t.string('uai');
      t.integer('decile_10');
    });
    await datamartKnex.schema.createTable('replication', (t) => {
      t.string('schoolUai');
      t.integer('firstDecileLevel');
    });
    await datawarehouseKnex('to-replicate').insert([{ uai: '0751234A', decile_10: 3 }]);
    const replications = {
      'my-replication': {
        source: 'to-replicate',
        target: 'replication',
        columns: { schoolUai: 'uai', firstDecileLevel: 'decile_10' },
      },
    };

    // when
    const result = await extractTransformAndLoadData({
      replicationName: 'my-replication',
      replications,
      datamartKnex,
      datawarehouseKnex,
    });

    // then
    expect(result).to.deep.equal({ count: 1 });
    expect(await datamartKnex('replication').select()).to.deep.equal([{ schoolUai: '0751234A', firstDecileLevel: 3 }]);
  });

  describe('when the source has json columns', function () {
    it('should replicate json values unchanged, including JSON null vs SQL NULL', async function () {
      // given: the datawarehouse connection disables json parsing (raw text), the datamart parses it
      await datawarehouseKnex.schema.createTable('to-replicate', (t) => {
        t.integer('id');
        t.jsonb('configuration');
      });
      await datamartKnex.schema.createTable('replication', (t) => {
        t.integer('id');
        t.jsonb('configuration');
      });
      await datawarehouseKnex.raw(`insert into "to-replicate" values
        (1, '{"scoring": "v3", "levels": [1, 2], "label": "quo\\"te, comma\\nnewline"}'),
        (2, '[1, "two", null]'),
        (3, '"a json string"'),
        (4, '42'),
        (5, 'null'),
        (6, NULL)`);
      const replications = {
        'json-replication': { source: 'to-replicate', target: 'replication', columns: ['id', 'configuration'] },
      };

      // when
      const result = await extractTransformAndLoadData({
        replicationName: 'json-replication',
        replications,
        datamartKnex,
        datawarehouseKnex,
      });

      // then
      expect(result).to.deep.equal({ count: 6 });
      const replicated = await datamartKnex('replication').select('id', 'configuration').orderBy('id');
      expect(replicated).to.deep.equal([
        { id: 1, configuration: { scoring: 'v3', levels: [1, 2], label: 'quo"te, comma\nnewline' } },
        { id: 2, configuration: [1, 'two', null] },
        { id: 3, configuration: 'a json string' },
        { id: 4, configuration: 42 },
        { id: 5, configuration: null },
        { id: 6, configuration: null },
      ]);
      const [{ jsonNulls }] = await datamartKnex('replication')
        .count({ jsonNulls: '*' })
        .whereRaw(`configuration = 'null'::jsonb`);
      const [{ sqlNulls }] = await datamartKnex('replication').count({ sqlNulls: '*' }).whereNull('configuration');
      expect(jsonNulls).to.equal(1);
      expect(sqlNulls).to.equal(1);
    });
  });
});
