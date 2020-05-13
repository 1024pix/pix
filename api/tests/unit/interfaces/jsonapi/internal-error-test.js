const { expect } = require('chai');

const JSONAPI = require('../../../../lib/infrastructure/serializers/jsonapi/response-objects');

describe('Unit | Interfaces | JSONAPI | Internal Error', () => {

  it('should create a new JSONAPI internal error with the given error message', () => {
    // given
    const errorMessage = 'Internal Error message';

    // when
    const jsonApiInternalError = JSONAPI.internalError(errorMessage);

    // then
    expect(jsonApiInternalError.errors).to.have.lengthOf(1);

    const internalError = jsonApiInternalError.errors[0];
    expect(internalError.status).to.equal('500');
    expect(internalError.title).to.equal('Internal Server Error');
    expect(internalError.detail).to.equal(errorMessage);
  });

});
