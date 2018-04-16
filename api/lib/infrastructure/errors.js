class InfrastructureError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Error';
    this.code = '500';
  }
}

class MissingQueryParamError extends InfrastructureError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.code = '400';
  }
}

module.exports = {
  InfrastructureError,
  MissingQueryParamError
};
