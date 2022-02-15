const { knex } = require('../../db/knex-database-connection');

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  knex(...args) {
    const builder = knex(...args);
    if (this.knexTransaction != null) builder.transacting(this.knexTransaction);
    return builder;
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
module.exports = DomainTransaction;
