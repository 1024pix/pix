import sinon from 'sinon';

import {
  asyncLocalStorage,
  DomainTransaction,
  withTransaction,
} from '../../../../src/shared/domain/DomainTransaction.js';
import { knex } from '../../../tooling/databases.js';

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
      knex.transaction.callsFake(async (fn) => fn(transactionStub));

      await DomainTransaction.execute(function () {
        // Something
      });

      expect(asyncLocalStorage.run).to.have.been.calledWith({ transaction: domainTransaction });
    });

    it('should return function result', async function () {
      const transactionConfiguration = { isolationLevel: 'read committed' };
      const expectedResult = Symbol('return');
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake(async (fn) => fn({}));

      await DomainTransaction.execute(() => expectedResult, transactionConfiguration);

      expect(knex.transaction.getCalls()[0].args).to.includes(transactionConfiguration);
    });

    it('should use configuration for transaction', async function () {
      const transactionStub = {};
      const domainTransaction = new DomainTransaction(transactionStub);
      sinon.stub(asyncLocalStorage, 'run');
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake(async (fn) => fn(transactionStub));

      await DomainTransaction.execute(function () {
        // Something
      });

      expect(asyncLocalStorage.run).to.have.been.calledWith({ transaction: domainTransaction });
    });
  });

  describe('#withTransaction', function () {
    it('should get transaction from store', async function () {
      const transactionStub = { commit: sinon.stub() };
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake(async (fn) => fn(transactionStub));
      const myUseCase = withTransaction(async () => {
        return DomainTransaction.getConnection();
      });
      const connection = await myUseCase();

      expect(connection).to.equal(transactionStub);
    });

    it('should use configuration for transaction', async function () {
      const transactionStub = {};
      const domainTransaction = new DomainTransaction(transactionStub);
      sinon.stub(asyncLocalStorage, 'run');
      sinon.stub(knex, 'transaction');
      knex.transaction.callsFake(async (fn) => fn(transactionStub));

      const myUseCase = withTransaction(async function () {
        // Something
      });
      await myUseCase();

      expect(asyncLocalStorage.run).to.have.been.calledWith({ transaction: domainTransaction });
    });
  });
});
