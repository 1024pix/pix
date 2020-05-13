const { expect } = require('chai');

const JSONAPI = require('../../../../lib/infrastructure/serializers/jsonapi/response-objects');

describe('Unit | Interfaces | JSONAPI | Empty Data Response', () => {

  it('should create a new JSONAPI response with null data', () => {
    // when
    const jsonApiEmptyData = JSONAPI.emptyDataResponse();

    // then
    expect(jsonApiEmptyData).to.deep.equal({
      data: null
    });
  });

});
