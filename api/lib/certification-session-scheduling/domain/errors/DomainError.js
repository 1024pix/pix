class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.code = code ;
    this.meta = meta ;
  }
}

module.exports = {
  DomainError,
};

