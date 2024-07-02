import { asyncLocalStorage, DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { expect, knex, sinon } from '../../../../tests/test-helper.js';

describe('Unit | Infrastructure | DomainTransaction', function () {
  describe('#getConnection', function () {
    it('should return connection from store', function () {
      const transaction = Symbol('transaction');
      const domainTransaction = new DomainTransaction(transaction);
      const storeStub = { transaction: domainTransaction };
      sinon.stub(asyncLocalStorage, 'getStore');
      asyncLocalStorage.getStore.returns(storeStub);

      const connection = DomainTransaction.getConnection();

      expect(connection).to.equal(transaction);
    });

    it('should return knex connection by default', function () {
      sinon.stub(asyncLocalStorage, 'getStore');

      const connection = DomainTransaction.getConnection();

      expect(connection).to.equal(knex);
    });
  });

  describe('#execute', function () {
    it('should store transaction', async function () {
      const transactionStub = {};
      const domainTransaction = new DomainTransaction(transactionStub);
      sinon.stub(asyncLocalStorage, 'run');
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake((fn) => fn(transactionStub));

      await DomainTransaction.execute(function () {
        // Something
      });

      expect(asyncLocalStorage.run).to.have.been.calledWith({ transaction: domainTransaction });
    });

    it('should return function result', async function () {
      const expectedResult = Symbol('return');
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake((fn) => fn({}));

      const result = await DomainTransaction.execute(() => expectedResult);

      expect(result).to.equal(expectedResult);
    });
  });
});
