import _ from 'lodash';

import { extractTransformAndLoadData } from '../../../../../src/maddo/domain/usecases/extract-transform-and-load-data.js';
import * as replicationRepository from '../../../../../src/maddo/infrastructure/repositories/replication-repository.js';
import { datamartKnex, datawarehouseKnex } from '../../../../tooling/databases.js';

describe('Maddo | Domain | Usecases | Integration | extract-transform-and-load-data', function () {
  beforeEach(async function () {
    const schema = (t) => {
      t.string('firstName').notNullable();
      t.string('lastName').notNullable();
    };
    await datawarehouseKnex.schema.dropTableIfExists('to-replicate');
    await datawarehouseKnex.schema.createTable('to-replicate', schema);
    await datamartKnex.schema.dropTableIfExists('replication');
    await datamartKnex.schema.createTable('replication', schema);
  });

  it('should run given replication', async function () {
    // given
    const replicationName = 'my-replication';
    const replication = {
      name: replicationName,
      before: async ({ datamartKnex }) => {
        await datamartKnex('replication').delete();
      },
      from: ({ datawarehouseKnex }) => {
        return datawarehouseKnex('to-replicate').select('*');
      },
      transform: ({ firstName, lastName }) => ({
        firstName: _.capitalize(firstName),
        lastName: _.capitalize(lastName),
      }),
      to: ({ datamartKnex }, chunk) => {
        return datamartKnex('replication').insert(chunk);
      },
    };

    replicationRepository.replications.push(replication);

    await datamartKnex('replication').insert([
      { firstName: 'oldfirst1', lastName: 'oldlast1' },
      { firstName: 'oldfirst2', lastName: 'oldlast2' },
    ]);
    await datawarehouseKnex('to-replicate').insert([
      { firstName: 'first1', lastName: 'last1' },
      { firstName: 'first2', lastName: 'last2' },
    ]);

    // when
    const result = await extractTransformAndLoadData({
      replicationName,
      replicationRepository,
      datamartKnex,
      datawarehouseKnex,
    });

    // then
    expect(result).to.deep.equal({ count: 2 });

    const replicatedData = await datamartKnex.select().from('replication').orderBy('firstName');
    expect(replicatedData).to.deep.equal([
      { firstName: 'First1', lastName: 'Last1' },
      { firstName: 'First2', lastName: 'Last2' },
    ]);
  });
});
