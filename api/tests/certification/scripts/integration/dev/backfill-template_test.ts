import { expect } from 'chai';
import type { Knex } from 'knex';
import sinon from 'sinon';

import { BackfillTemplate } from '../../../../../src/certification/scripts/dev/backfill-template.ts';
import { knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

type ScriptParams = Parameters<BackfillTemplate['handle']>[0];
type Item = { id: number; isInvalid: boolean; updatedAt: Date | null };

describe('Certification | Scripts | Integration | Dev | BackfillTemplate', function () {
  const knexConn = knex as Knex;
  let script: BackfillTemplate;
  let logger: { info: sinon.SinonStub; error: sinon.SinonStub };
  let sleep: sinon.SinonStub;

  // The template works on a fake "items" table, created for these tests only.
  // An invalid item cannot be updated: it makes the batch containing it fail.
  before(async function () {
    await knexConn.schema.createTable('items', (table) => {
      table.increments('id').primary();
      table.boolean('isInvalid').notNullable().defaultTo(false);
      table.dateTime('updatedAt').nullable();
      table.check('NOT "isInvalid" OR "updatedAt" IS NULL');
    });
  });

  after(async function () {
    await knexConn.schema.dropTable('items');
  });

  beforeEach(function () {
    script = new BackfillTemplate();
    logger = { info: sinon.stub(), error: sinon.stub() };
    sleep = sinon.stub().resolves();
  });

  afterEach(async function () {
    await knexConn('items').truncate();
  });

  function insertItems(ids: number[], { invalidIds = [] }: { invalidIds?: number[] } = {}) {
    return knexConn('items').insert(ids.map((id) => ({ id, isInvalid: invalidIds.includes(id) })));
  }

  async function findUpdatedItemIds() {
    const items = await knexConn<Item>('items').select('id').whereNotNull('updatedAt').orderBy('id');
    return items.map(({ id }) => id);
  }

  function handle(options: Partial<ScriptParams['options']>) {
    return script.handle({
      command: '',
      logger: logger as unknown as ScriptParams['logger'],
      options: { dryRun: false, throttleDelay: 5, startId: 1, chunkSize: 3, ...options },
      dependencies: { sleep },
    });
  }

  function infoLogs() {
    return logger.info.args.map(([message]) => message as string).slice(1);
  }

  context('dryRun', function () {
    it('does not persist any change when dryRun is true', async function () {
      // given
      await insertItems([1, 2, 3, 4]);

      // when
      await handle({ dryRun: true });

      // then
      expect(await findUpdatedItemIds()).to.deep.equal([]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 3 done',
        'Batch from 4 to 6 done',
        'Script finished. Number of items processed : 4, youpi',
      ]);
    });

    it('persists the changes when dryRun is false', async function () {
      // given
      await insertItems([1, 2, 3, 4]);

      // when
      await handle({ dryRun: false });

      // then
      expect(await findUpdatedItemIds()).to.deep.equal([1, 2, 3, 4]);
    });
  });

  context('chunks', function () {
    it('scans the whole table by chunks of ids, including chunks without any item', async function () {
      // given
      await insertItems([1, 2, 10]);

      // when
      await handle({ chunkSize: 3 });

      // then
      expect(await findUpdatedItemIds()).to.deep.equal([1, 2, 10]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 3 done',
        'Batch from 4 to 6 done',
        'Batch from 7 to 9 done',
        'Batch from 10 to 12 done',
        'Script finished. Number of items processed : 3, youpi',
      ]);
    });

    it('starts from the given id', async function () {
      // given
      await insertItems([1, 2, 3, 4, 5]);

      // when
      await handle({ startId: 3, chunkSize: 2 });

      // then
      expect(await findUpdatedItemIds()).to.deep.equal([3, 4, 5]);
      expect(infoLogs()).to.deep.equal([
        'Batch from 3 to 4 done',
        'Batch from 5 to 6 done',
        'Script finished. Number of items processed : 3, youpi',
      ]);
    });

    it('does nothing when the table is empty', async function () {
      // when
      await handle({});

      // then
      expect(infoLogs()).to.deep.equal(['Script finished. Number of items processed : 0, youpi']);
    });

    it('does not process items created during the run', async function () {
      // given
      await insertItems([1, 2]);
      sleep.onFirstCall().callsFake(() => insertItems([4]));

      // when
      await handle({ chunkSize: 3 });

      // then
      expect(await findUpdatedItemIds()).to.deep.equal([1, 2]);
    });
  });

  context('throttle', function () {
    it('waits for the throttle delay after each chunk', async function () {
      // given
      await insertItems([1, 2, 3, 4]);

      // when
      await handle({ chunkSize: 2, throttleDelay: 42 });

      // then
      expect(sleep.args).to.deep.equal([[42], [42]]);
    });
  });

  context('when an error occurs in a chunk', function () {
    it('stops the script, rolls back the failing chunk and keeps the previous ones', async function () {
      // given
      await insertItems([1, 2, 3, 4, 5], { invalidIds: [4] });

      // when
      const error = await catchErr(handle)({ chunkSize: 2 });

      // then
      expect(error).to.be.instanceOf(Error);
      expect(await findUpdatedItemIds()).to.deep.equal([1, 2]);
      expect(logger.error.callCount).to.equal(1);
      expect(logger.error.firstCall.args[0]).to.match(/^An error happened in batch 3 - 4 : /);
      expect(infoLogs()).to.deep.equal([
        'Batch from 1 to 2 done',
        'Script interrupted. Number of items processed so far : 2',
        'To resume, run the script again with --startId=3',
      ]);
    });
  });
});
