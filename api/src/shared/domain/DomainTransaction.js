import { AsyncLocalStorage } from 'node:async_hooks';

import { knex } from '../../../db/knex-database-connection.js';

const asyncLocalStorage = new AsyncLocalStorage();

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  static execute(lambda, transactionConfig) {
    return knex.transaction((trx) => {
      const domainTransaction = new DomainTransaction(trx);
      return asyncLocalStorage.run({ transaction: domainTransaction }, lambda, domainTransaction);
    }, transactionConfig);
  }

  static getConnection() {
    const store = asyncLocalStorage.getStore();

    if (store?.transaction) {
      const domainTransaction = store.transaction;
      return domainTransaction.knexTransaction;
    }
    return knex;
  }

  static emptyTransaction() {
    return new DomainTransaction(null);
  }
}

/**
 * @template F
 * @param {F} func
 * @param {import('knex').Knex.TransactionConfig | undefined} transactionConfig
 * @returns {F}
 */
function withTransaction(func, transactionConfig) {
  return (...args) => DomainTransaction.execute(() => func(...args), transactionConfig);
}

export { asyncLocalStorage, DomainTransaction, withTransaction };
