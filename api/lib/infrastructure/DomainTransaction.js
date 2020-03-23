class DomainTransaction {
  async commit() {}
  async rollback() {}
  static begin() {
    return new DomainTransaction();
  }
}
module.exports = DomainTransaction;
