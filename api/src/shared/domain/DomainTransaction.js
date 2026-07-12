import { AsyncLocalStorage } from 'node:async_hooks';

import { getDb } from '../../../db/knex-database-connection.js';
import { featureToggles } from '../infrastructure/feature-toggles/index.js';

/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('knex').Knex.Transaction} Transaction
 * @typedef {import('knex').Knex.TransactionConfig} TransactionConfig
 */

const asyncLocalStorage = new AsyncLocalStorage();

class DomainTransaction {
  /**
   * @param {Transaction} knexTransaction
   */
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
    this.successHandlers = [];
  }

  /**
   * @template {Function} Lambda
   * @param {Lambda} lambda
   * @param {TransactionConfig=} transactionConfig
   * @returns {ReturnType<Lambda> | Promise<ReturnType<Lambda>>}
   */
  static execute(lambda, transactionConfig) {
    const existingConn = DomainTransaction.getConnection();
    if (existingConn.isTransaction) {
      return lambda();
    }
    let domainTransaction;
    return getDb()
      .transaction((trx) => {
        domainTransaction = new DomainTransaction(trx);
        return asyncLocalStorage.run({ transaction: domainTransaction }, lambda, domainTransaction);
      }, transactionConfig)
      .then(async (result) => {
        for (const handler of domainTransaction.successHandlers) {
          await handler();
        }
        return result;
      })
      .finally(() => {
        domainTransaction.successHandlers = [];
      });
  }

  /**
   *
   * @param {Function} handler : handler executed after transaction is successful
   *
   * @description Important notice: success handlers shall not be massively used
   * You should be able to declare code to be exectuted after transaction success in a better way
   * i.e declaring code **after** DomainTransaction.execture call :
   *  -- myUsecase.js
   *  function myUsecase() {
   *    await DomainTransaction.execute(() => {
   *      -- transactional code
   *    });
   *
   *    -- sending job after transaction is successful
   *    await myJob.performAsync(payload);
   *  }
   */
  static async addSuccessHandler(handler) {
    const store = asyncLocalStorage.getStore();
    const isSuccessHandlerEnabled = await featureToggles.get('successHandlersForDomainTransaction');

    if (store?.transaction && isSuccessHandlerEnabled) {
      store.transaction.successHandlers.push(handler);
    } else {
      await handler();
    }
  }

  /**
   * @returns {Knex | Transaction}
   */
  static getConnection() {
    const store = asyncLocalStorage.getStore();

    if (store?.transaction) {
      const domainTransaction = store.transaction;
      return domainTransaction.knexTransaction;
    }
    return getDb();
  }

  static emptyTransaction() {
    return new DomainTransaction(null);
  }
}

/**
 * @template {Function} F
 * @param {F} func
 * @param {TransactionConfig=} transactionConfig
 * @returns {F}
 */
function withTransaction(func, transactionConfig) {
  return (...args) => DomainTransaction.execute(() => func(...args), transactionConfig);
}

export { asyncLocalStorage, DomainTransaction, withTransaction };
