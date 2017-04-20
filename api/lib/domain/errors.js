class NotFoundError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = { NotFoundError };
