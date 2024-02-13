import { expect, sinon, knex, catchErr } from '../../../../test-helper.js';
import { asyncLocalStorage } from '../../../../../src/prescription/shared/infrastructure/utils/async-local-storage.js';
import { ApplicationTransaction } from '../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';

describe('Unit | Infrastructure | application-transaction', function () {
  describe('#getTransactionAsDomainTransaction', function () {
    it('should return transaction as a DomainTransaction', function () {
      const transaction = Symbol('transaction');
      const storeStub = { transaction };
      sinon.stub(asyncLocalStorage, 'getStore');
      asyncLocalStorage.getStore.returns(storeStub);

      const domainTransaction = ApplicationTransaction.getTransactionAsDomainTransaction();

      expect(domainTransaction).to.be.instanceof(DomainTransaction);
      expect(domainTransaction.knexTransaction).to.equal(transaction);
    });

    it('should throw an error if there is no transaction', async function () {
      sinon.stub(asyncLocalStorage, 'getStore');
      asyncLocalStorage.getStore.returns();

      const err = await catchErr(ApplicationTransaction.getTransactionAsDomainTransaction)();

      expect(err.message).to.equal('No transaction');
    });
  });

  describe('#getConnection', function () {
    it('should return connection from store', function () {
      const transaction = Symbol('transaction');
      const storeStub = { transaction };
      sinon.stub(asyncLocalStorage, 'getStore');
      asyncLocalStorage.getStore.returns(storeStub);

      const connection = ApplicationTransaction.getConnection();

      expect(connection).to.equal(transaction);
    });

    it('should return connection from domainTransaction if provided', function () {
      const transaction = Symbol('transaction');
      const domainTransaction = { knexTransaction: transaction };
      sinon.stub(asyncLocalStorage, 'getStore');

      const connection = ApplicationTransaction.getConnection(domainTransaction);

      expect(connection).to.equal(transaction);
    });

    it('should return knex connection by default', function () {
      sinon.stub(asyncLocalStorage, 'getStore');

      const connection = ApplicationTransaction.getConnection();

      expect(connection).to.equal(knex);
    });
  });

  describe('#execute', function () {
    it('should commit transaction', async function () {
      const transactionStub = {
        commit: sinon.stub(),
      };
      sinon.stub(asyncLocalStorage, 'run');
      sinon.stub(knex, 'transaction');
      knex.transaction.resolves(transactionStub);

      await ApplicationTransaction.execute(function () {
        // Something
      });

      expect(transactionStub.commit).to.have.been.called;
    });

    it('should rollback and throw error if something went wrong', async function () {
      const transactionStub = {
        rollback: sinon.stub(),
      };
      sinon.stub(asyncLocalStorage, 'run').callsFake((_, cb) => cb());
      sinon.stub(knex, 'transaction');
      knex.transaction.resolves(transactionStub);

      await catchErr(ApplicationTransaction.execute)(function () {
        throw new Error();
      });

      expect(transactionStub.rollback).to.have.been.called;
    });

    it('should store transaction', async function () {
      const transactionStub = {
        commit: sinon.stub(),
      };
      sinon.stub(asyncLocalStorage, 'run');
      sinon.stub(knex, 'transaction');
      knex.transaction.resolves(transactionStub);

      await ApplicationTransaction.execute(function () {
        // Something
      });

      expect(asyncLocalStorage.run).to.have.been.calledWith({ transaction: transactionStub });
    });

    it('should return function result', async function () {
      const expectedResult = Symbol('return');
      const transactionStub = {
        commit: sinon.stub(),
      };
      sinon.stub(asyncLocalStorage, 'run').resolves(expectedResult);
      sinon.stub(knex, 'transaction');
      knex.transaction.resolves(transactionStub);

      const result = await ApplicationTransaction.execute();

      expect(result).to.equal(expectedResult);
    });
  });
});
