const { expect } = require('chai');

const JSONAPI = require('../../../../lib/infrastructure/serializers/jsonapi/response-objects');

describe('Unit | Interfaces | JSONAPI | Forbidden Error', () => {

  it('should create a new JSONAPI forbidden error with the given error message', () => {
    // given
    const errorMessage = 'Forbidden Error message';

    // when
    const jsonApiForbiddenError = JSONAPI.forbiddenError(errorMessage);

    // then
    expect(jsonApiForbiddenError.errors).to.have.lengthOf(1);

    const forbiddenError = jsonApiForbiddenError.errors[0];
    expect(forbiddenError.status).to.equal('403');
    expect(forbiddenError.title).to.equal('Forbidden Error');
    expect(forbiddenError.detail).to.equal(errorMessage);
  });

});
