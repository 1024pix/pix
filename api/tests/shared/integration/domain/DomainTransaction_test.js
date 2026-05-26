import sinon from 'sinon';

import { DomainTransaction, withTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../test-helper.js';
import { knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Shared | Integration | Domain | DomainTransaction', function () {
  context('behaviour when nesting', function () {
    context('withTransaction in withTransaction', function () {
      it('should use the same transaction all the way', async function () {
        // given
        let didIGoAllTheWayToTheEnd = false;
        const addTwoFeaturesInTwoNestedWithTransaction = withTransaction(async function () {
          const knexConnA = DomainTransaction.getConnection();

          // check empty in scope A
          const keys0 = await knexConnA('features').pluck('key');
          expect(keys0, 'it starts with an empty table').to.deepEqualArray([]);

          // insert in scope A
          await knexConnA('features').insert({ key: 'scopeA' });

          // check has one in scope A
          const keys1 = await knexConnA('features').pluck('key');
          expect(keys1, '"scopeA" has been inserted in first layer').to.deepEqualArray(['scopeA']);

          // nested scope
          await withTransaction(async function () {
            const knexConnB = DomainTransaction.getConnection();

            // check already has one in scope B
            const keys1 = await knexConnB('features').pluck('key');
            expect(keys1, '"scopeA" found in second layer').to.deepEqualArray(['scopeA']);

            // insert in scope B
            await knexConnB('features').insert({ key: 'scopeB' });

            // check has two in scope B
            const keys2 = await knexConnB('features').pluck('key').orderBy('key');
            expect(keys2, '"scopeB" also inserted, but in second layer').to.deepEqualArray(['scopeA', 'scopeB']);
            didIGoAllTheWayToTheEnd = true;
          })();
        });

        // when
        await addTwoFeaturesInTwoNestedWithTransaction();

        // then
        expect(didIGoAllTheWayToTheEnd).to.be.true;
        const finalKeys = await knex('features').pluck('key').orderBy('key');
        expect(finalKeys).to.deepEqualArray(['scopeA', 'scopeB']);
      });

      it('should rollback everything when something goes wrong in the nested scope', async function () {
        // given
        const addTwoFeaturesInTwoNestedWithTransaction = withTransaction(async function () {
          const knexConnA = DomainTransaction.getConnection();

          await knexConnA('features').insert({ key: 'scopeA' });

          await withTransaction(async function () {
            const knexConnB = DomainTransaction.getConnection();

            await knexConnB('features').insert({ key: 'scopeB' });

            throw new Error("Let's rollback !");
          })();
        });

        // when
        const err = await catchErr(addTwoFeaturesInTwoNestedWithTransaction)();

        // then
        expect(err.message).to.equal("Let's rollback !");
        const { count } = await knex('features').count('id').first();
        expect(count).to.equal(0);
      });
    });

    context('withTransaction in DomainTransaction.execute', function () {
      it('should use the same transaction all the way', async function () {
        // given
        let didIGoAllTheWayToTheEnd = false;
        const addTwoFeaturesInDomainTrExecuteAndWithTransaction = async function () {
          const knexConnA = DomainTransaction.getConnection();

          // check empty in scope A
          const keys0 = await knexConnA('features').pluck('key');
          expect(keys0, 'it starts with an empty table').to.deepEqualArray([]);

          // insert in scope A
          await knexConnA('features').insert({ key: 'scopeA' });

          // check has one in scope A
          const keys1 = await knexConnA('features').pluck('key');
          expect(keys1, '"scopeA" has been inserted in first layer').to.deepEqualArray(['scopeA']);

          // nested scope
          await withTransaction(async function () {
            const knexConnB = DomainTransaction.getConnection();

            // check already has one in scope B
            const keys1 = await knexConnB('features').pluck('key');
            expect(keys1, '"scopeA" found in second layer').to.deepEqualArray(['scopeA']);

            // insert in scope B
            await knexConnB('features').insert({ key: 'scopeB' });

            // check has two in scope B
            const keys2 = await knexConnB('features').pluck('key').orderBy('key');
            expect(keys2, '"scopeB" also inserted, but in second layer').to.deepEqualArray(['scopeA', 'scopeB']);
            didIGoAllTheWayToTheEnd = true;
          })();
        };

        // when
        await DomainTransaction.execute(addTwoFeaturesInDomainTrExecuteAndWithTransaction);

        // then
        expect(didIGoAllTheWayToTheEnd).to.be.true;
        const finalKeys = await knex('features').pluck('key').orderBy('key');
        expect(finalKeys).to.deepEqualArray(['scopeA', 'scopeB']);
      });

      it('should rollback everything when something goes wrong in the nested scope', async function () {
        // given
        const addTwoFeaturesInDomainTrExecuteAndWithTransaction = async function () {
          const knexConnA = DomainTransaction.getConnection();

          await knexConnA('features').insert({ key: 'scopeA' });

          await withTransaction(async function () {
            const knexConnB = DomainTransaction.getConnection();

            await knexConnB('features').insert({ key: 'scopeB' });

            throw new Error("Let's rollback !");
          })();
        };

        // when
        const err = await catchErr(DomainTransaction.execute)(addTwoFeaturesInDomainTrExecuteAndWithTransaction);

        // then
        expect(err.message).to.equal("Let's rollback !");
        const { count } = await knex('features').count('id').first();
        expect(count).to.equal(0);
      });
    });

    context('DomainTransaction.execute in DomainTransaction.execute', function () {
      it('should use the same transaction all the way', async function () {
        // given
        let didIGoAllTheWayToTheEnd = false;
        const addTwoFeaturesInTwoDomainTrExecute = async function () {
          const knexConnA = DomainTransaction.getConnection();

          // check empty in scope A
          const keys0 = await knexConnA('features').pluck('key');
          expect(keys0, 'it starts with an empty table').to.deepEqualArray([]);

          // insert in scope A
          await knexConnA('features').insert({ key: 'scopeA' });

          // check has one in scope A
          const keys1 = await knexConnA('features').pluck('key');
          expect(keys1, '"scopeA" has been inserted in first layer').to.deepEqualArray(['scopeA']);

          // nested scope
          await DomainTransaction.execute(async function () {
            const knexConnB = DomainTransaction.getConnection();

            // check already has one in scope B
            const keys1 = await knexConnB('features').pluck('key');
            expect(keys1, '"scopeA" found in second layer').to.deepEqualArray(['scopeA']);

            // insert in scope B
            await knexConnB('features').insert({ key: 'scopeB' });

            // check has two in scope B
            const keys2 = await knexConnB('features').pluck('key').orderBy('key');
            expect(keys2, '"scopeB" also inserted, but in second layer').to.deepEqualArray(['scopeA', 'scopeB']);
            didIGoAllTheWayToTheEnd = true;
          });
        };

        // when
        await DomainTransaction.execute(addTwoFeaturesInTwoDomainTrExecute);

        // then
        expect(didIGoAllTheWayToTheEnd).to.be.true;
        const finalKeys = await knex('features').pluck('key').orderBy('key');
        expect(finalKeys).to.deepEqualArray(['scopeA', 'scopeB']);
      });

      it('should rollback everything when something goes wrong in the nested scope', async function () {
        // given
        const addTwoFeaturesInTwoDomainTrExecute = async function () {
          const knexConnA = DomainTransaction.getConnection();

          await knexConnA('features').insert({ key: 'scopeA' });

          await DomainTransaction.execute(async function () {
            const knexConnB = DomainTransaction.getConnection();

            await knexConnB('features').insert({ key: 'scopeB' });

            throw new Error("Let's rollback !");
          });
        };

        // when
        const err = await catchErr(DomainTransaction.execute)(addTwoFeaturesInTwoDomainTrExecute);

        // then
        expect(err.message).to.equal("Let's rollback !");
        const { count } = await knex('features').count('id').first();
        expect(count).to.equal(0);
      });
    });

    context('DomainTransaction.execute in withTransaction', function () {
      it('should use the same transaction all the way', async function () {
        // given
        let didIGoAllTheWayToTheEnd = false;
        const addTwoFeaturesInWithTransactioAndDomainTrExecute = withTransaction(async function () {
          const knexConnA = DomainTransaction.getConnection();

          // check empty in scope A
          const keys0 = await knexConnA('features').pluck('key');
          expect(keys0, 'it starts with an empty table').to.deepEqualArray([]);

          // insert in scope A
          await knexConnA('features').insert({ key: 'scopeA' });

          // check has one in scope A
          const keys1 = await knexConnA('features').pluck('key');
          expect(keys1, '"scopeA" has been inserted in first layer').to.deepEqualArray(['scopeA']);

          // nested scope
          await DomainTransaction.execute(async function () {
            const knexConnB = DomainTransaction.getConnection();

            // check already has one in scope B
            const keys1 = await knexConnB('features').pluck('key');
            expect(keys1, '"scopeA" found in second layer').to.deepEqualArray(['scopeA']);

            // insert in scope B
            await knexConnB('features').insert({ key: 'scopeB' });

            // check has two in scope B
            const keys2 = await knexConnB('features').pluck('key').orderBy('key');
            expect(keys2, '"scopeB" also inserted, but in second layer').to.deepEqualArray(['scopeA', 'scopeB']);
            didIGoAllTheWayToTheEnd = true;
          });
        });

        // when
        await addTwoFeaturesInWithTransactioAndDomainTrExecute();

        // then
        expect(didIGoAllTheWayToTheEnd).to.be.true;
        const finalKeys = await knex('features').pluck('key').orderBy('key');
        expect(finalKeys).to.deepEqualArray(['scopeA', 'scopeB']);
      });

      it('should rollback everything when something goes wrong in the nested scope', async function () {
        // given
        const addTwoFeaturesInWithTransactioAndDomainTrExecute = withTransaction(async function () {
          const knexConnA = DomainTransaction.getConnection();

          await knexConnA('features').insert({ key: 'scopeA' });

          await DomainTransaction.execute(async function () {
            const knexConnB = DomainTransaction.getConnection();

            await knexConnB('features').insert({ key: 'scopeB' });

            throw new Error("Let's rollback !");
          });
        });

        // when
        const err = await catchErr(addTwoFeaturesInWithTransactioAndDomainTrExecute)();

        // then
        expect(err.message).to.equal("Let's rollback !");
        const { count } = await knex('features').count('id').first();
        expect(count).to.equal(0);
      });
    });
  });

  context('onSuccess management', function () {
    context('when transaction is committed', function () {
      it('executes onSuccess handlers after transaction is committed', async function () {
        const afterSuccessHandler = sinon.stub().resolves();
        const successHandler1 = sinon.stub().resolves();
        const successHandler2 = sinon.stub().resolves();

        const result = await DomainTransaction.execute(async () => {
          await DomainTransaction.addSuccessHandler(successHandler1);
          await afterSuccessHandler();
          await DomainTransaction.addSuccessHandler(successHandler2);
          return 'result';
        });

        expect(successHandler1.calledAfter(afterSuccessHandler)).to.be.true;
        expect(successHandler2.calledAfter(successHandler1)).to.be.true;
        expect(result).to.equal('result');
      });
    });

    context('when transaction is rollbacked', function () {
      it('does not execute onSuccess handlers after transaction is rollbacked', async function () {
        const afterSuccessHandler = sinon.stub().rejects(new Error('Error during transaction'));
        const successHandler = sinon.stub().resolves();

        await expect(
          DomainTransaction.execute(async () => {
            await DomainTransaction.addSuccessHandler(successHandler);
            await afterSuccessHandler();
            return 'result';
          }),
        ).to.be.rejectedWith(Error);

        expect(successHandler).to.not.have.been.called;
      });
    });

    context('when there is no transactions', function () {
      it('executes onSuccess handlers immediately', async function () {
        const afterSuccessHandler = sinon.stub().resolves();
        const successHandler = sinon.stub().resolves();

        await DomainTransaction.addSuccessHandler(successHandler);
        await afterSuccessHandler();

        expect(successHandler.calledBefore(afterSuccessHandler)).to.be.true;
      });
    });

    context('when success handlers are defined in deeper functions', function () {
      it('executes onSuccess handlers after transaction is committed', async function () {
        const firstCallProcess = sinon.stub().resolves();
        const secondCallProcess = sinon.stub().resolves();
        const firstCallSuccessHandler = sinon.stub().resolves();
        const secondCallSuccessHandler = sinon.stub().resolves();

        async function firstCall() {
          await DomainTransaction.addSuccessHandler(firstCallSuccessHandler);
          await firstCallProcess();
        }
        async function secondCall() {
          await DomainTransaction.addSuccessHandler(secondCallSuccessHandler);
          await secondCallProcess();
        }

        const myTransaction = withTransaction(async () => {
          await firstCall();
          await secondCall();
        });
        await myTransaction();

        expect(secondCallProcess.calledAfter(firstCallProcess)).to.be.true;
        expect(firstCallSuccessHandler.calledAfter(secondCallProcess)).to.be.true;
        expect(secondCallSuccessHandler.calledAfter(secondCallProcess)).to.be.true;
        expect(secondCallSuccessHandler.calledAfter(firstCallSuccessHandler)).to.be.true;
      });
    });

    context('when successHandlersForDomainTransaction feature toggle is disabled', function () {
      it('executes onSuccess handlers immediately', async function () {
        await featureToggles.set('successHandlersForDomainTransaction', false);

        const inTransactionFunction = sinon.stub().resolves();
        const successHandler1 = sinon.stub().resolves();
        const successHandler2 = sinon.stub().resolves();

        const result = await DomainTransaction.execute(async () => {
          await DomainTransaction.addSuccessHandler(successHandler1);
          await inTransactionFunction();
          await DomainTransaction.addSuccessHandler(successHandler2);
          return 'result';
        });

        expect(successHandler1.calledBefore(inTransactionFunction)).to.be.true;
        expect(inTransactionFunction.calledBefore(successHandler2)).to.be.true;
        expect(result).to.equal('result');
      });
    });
  });
});
