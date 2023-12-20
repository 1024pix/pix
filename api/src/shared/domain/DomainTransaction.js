import { knex } from '../../../db/knex-database-connection.js';

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  static execute(lambda) {
    return knex.transaction((trx) => {
      return lambda(new DomainTransaction(trx));
    });
  }

  static emptyTransaction() {
    return new DomainTransaction(null);
  }
}
export { DomainTransaction };
