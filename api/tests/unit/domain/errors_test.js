const {describe, it, expect} = require('../../test-helper');
const errors = require('../../../lib/domain/errors');

describe('Unit | Domain | Errors', () => {

  it('should export a NotFoundError', () => {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export a InvalidTokenError', () => {
    expect(errors.InvalidTokenError).to.exist;
  });

});
