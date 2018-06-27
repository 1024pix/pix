const { expect } = require('chai');

const JSONAPI = require('../../../../lib/interfaces/jsonapi');

describe('Unit | Interfaces | JSONAPI | Unprocessable Entity Error', () => {

  it('should create a new JSONAPI unprocessable entity error with the given error message', () => {
    // given
    const errorMessage = 'Unprocessable Entity Error message';

    // when
    const jsonApiInternalError = JSONAPI.unprocessableEntityError(errorMessage);

    // then
    expect(jsonApiInternalError.errors).to.have.lengthOf(1);

    const internalError = jsonApiInternalError.errors[0];
    expect(internalError.status).to.equal('422');
    expect(internalError.title).to.equal('Unprocessable Entity Error');
    expect(internalError.detail).to.equal(errorMessage);
  });

});
