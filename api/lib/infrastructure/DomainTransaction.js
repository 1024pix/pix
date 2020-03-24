const { knex } = require('../../db/knex-database-connection');

class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }
  async commit() {
    await this.knexTransaction.commit();
  }
  async rollback() {
    await this.knexTransaction.rollback();
  }

  static async begin() {
    return new DomainTransaction(
      await knex.transaction()
    );
  }
}
module.exports = DomainTransaction;
