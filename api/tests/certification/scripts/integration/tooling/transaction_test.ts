import { expect } from 'chai';
import type { Knex } from 'knex';

import { executeInTransaction } from '../../../../../src/certification/scripts/tooling/transaction.ts';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Certification | Scripts | Integration | Tooling | Transaction', function () {
  const knexConn = knex as Knex;

  describe('#executeInTransaction', function () {
    let userId: number;

    beforeEach(function () {
      const user = databaseBuilder.factory.buildUser({ firstName: 'Before' }) as { id: number };
      userId = user.id;
      return databaseBuilder.commit();
    });

    function renameUser() {
      return DomainTransaction.getConnection()('users').where({ id: userId }).update({ firstName: 'After' });
    }

    async function getFirstName() {
      const user = await knexConn<{ id: number; firstName: string }>('users')
        .select('firstName')
        .where({ id: userId })
        .first();
      return user?.firstName;
    }

    context('when dryRun is true', function () {
      it('rolls back the changes without throwing', async function () {
        // when
        await executeInTransaction({ dryRun: true }, renameUser);

        // then
        expect(await getFirstName()).to.equal('Before');
      });
    });

    context('when dryRun is false', function () {
      it('commits the changes', async function () {
        // when
        await executeInTransaction({ dryRun: false }, renameUser);

        // then
        expect(await getFirstName()).to.equal('After');
      });
    });

    context('when the given function throws', function () {
      it('rolls back the changes and rethrows the error', async function () {
        // given
        const expectedError = new Error('Boom');

        // when
        const error = (await catchErr(executeInTransaction)({ dryRun: false }, async () => {
          await renameUser();
          throw expectedError;
        })) as Error;

        // then
        expect(error).to.equal(expectedError);
        expect(await getFirstName()).to.equal('Before');
      });
    });

    context('when called within an existing transaction', function () {
      it('throws without calling the given function', async function () {
        // given
        let hasBeenCalled = false;

        // when
        const error = (await catchErr(() =>
          DomainTransaction.execute(() =>
            executeInTransaction({ dryRun: true }, () => {
              hasBeenCalled = true;
              return Promise.resolve();
            }),
          ),
        )()) as Error;

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('executeInTransaction must not be nested in another transaction');
        expect(hasBeenCalled).to.equal(false);
      });
    });
  });
});
