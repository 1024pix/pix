const { expect } = require('../../../test-helper');
const error = require('../../../../lib/infrastructure/validators/errors');

describe('Unit | Validator | Errors', () => {

  it('should export a InvalidRecaptchaTokenError', () => {
    expect(error.InvalidRecaptchaTokenError).to.exist;
  });

});
