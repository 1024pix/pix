class InvalidRecaptchaTokenError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = { InvalidRecaptchaTokenError };

