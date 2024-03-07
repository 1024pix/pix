import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { asyncLocalStorage } from './utils/async-local-storage.js';

class ApplicationTransaction {
  static getConnection(domainTransaction = DomainTransaction.emptyTransaction()) {
    const store = asyncLocalStorage.getStore();

    if (domainTransaction.knexTransaction) {
      return domainTransaction.knexTransaction;
    } else if (store?.transaction) {
      return store.transaction;
    }
    return knex;
  }

  static getTransactionAsDomainTransaction() {
    const store = asyncLocalStorage.getStore();

    if (!store?.transaction) throw new Error('No transaction');

    return new DomainTransaction(store.transaction);
  }

  static async execute(func) {
    const trx = await knex.transaction();
    let result;

    try {
      result = await asyncLocalStorage.run({ transaction: trx }, func);
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    await trx.commit();
    return result;
  }
}

export { ApplicationTransaction };
