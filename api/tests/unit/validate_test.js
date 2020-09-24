const { pick } = require('lodash');

const { expect, hFake } = require('../test-helper');
const { BadRequestError } = require('../../lib/application/http-errors');

const { handleFailAction } = require('../../lib/validate');

describe('Unit | Validate', () => {

  let expectedResponse;

  beforeEach(() => {
    const { title: defaultTitle, status: defaultStatus } = new BadRequestError();

    expectedResponse = {
      source: {
        errors: [{
          status: defaultStatus.toString(),
          title: defaultTitle,
        }],
      },
      statusCode: defaultStatus,
    };
  });

  it('should generate a response with BadRequest default error\'s title, status and statusCode', () => {
    // given
    const error = undefined;

    // when
    const response = handleFailAction(null, hFake, error);

    // then
    expect(
      pick(response, ['source', 'statusCode']))
      .deep.equal(expectedResponse);
  });

  it('should generate a response with BadRequest default parameters and detail error message', () => {
    // given
    const expectedErrorMessage = 'This is a specific error message';
    const error = {
      details: [{ message: expectedErrorMessage }],
    };

    expectedResponse.source.errors[0].detail = expectedErrorMessage;

    // when
    const response = handleFailAction(null, hFake, error);

    // then
    expect(
      pick(response, ['source', 'statusCode']))
      .deep.equal(expectedResponse);
  });
});
