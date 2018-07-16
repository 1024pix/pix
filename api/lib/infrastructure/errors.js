class InfrastructureError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Internal Server Error';
    this.code = 500;
  }
}

class ConflictError extends InfrastructureError {
  constructor(reason = 'Conflict between request and server state.') {
    super(reason);
    this.title = 'Conflict';
    this.code = 409;
  }
}

class MissingQueryParamError extends InfrastructureError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.code = 400;
  }
}

module.exports = {
  InfrastructureError,
  ConflictError,
  MissingQueryParamError,
};
