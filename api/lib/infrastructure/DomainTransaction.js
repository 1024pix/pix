const { knex } = require('../../db/knex-database-connection');

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  static execute(lambda) {
    return knex.transaction((trx) => {
      return lambda(new DomainTransaction(trx));
    });
  }
}
module.exports = DomainTransaction;
