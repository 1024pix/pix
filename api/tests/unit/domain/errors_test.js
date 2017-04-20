const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../test-helper');

const errors = require('../../../lib/domain/errors');

describe('Unit | Domain | Errors', () => {

  it('should export a NotFoundError', () => {
    expect(errors.NotFoundError).to.exist;
  });

});
