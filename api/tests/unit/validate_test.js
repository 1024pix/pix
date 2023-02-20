import { pick } from 'lodash';
import { expect, hFake } from '../test-helper';
import { BadRequestError } from '../../lib/application/http-errors';
import { handleFailAction } from '../../lib/validate';

describe('Unit | Validate', function () {
  let expectedResponse;

  beforeEach(function () {
    const { title: defaultTitle, status: defaultStatus } = new BadRequestError();

    expectedResponse = {
      source: {
        errors: [
          {
            status: defaultStatus.toString(),
            title: defaultTitle,
          },
        ],
      },
      statusCode: defaultStatus,
    };
  });

  it("should generate a response with BadRequest default error's title, status and statusCode", function () {
    // given
    const error = undefined;

    // when
    const response = handleFailAction(null, hFake, error);

    // then
    expect(pick(response, ['source', 'statusCode'])).deep.equal(expectedResponse);
  });

  it('should generate a response with BadRequest default parameters and detail error message', function () {
    // given
    const expectedErrorMessage = 'This is a specific error message';
    const error = {
      details: [{ message: expectedErrorMessage }],
    };

    expectedResponse.source.errors[0].detail = expectedErrorMessage;

    // when
    const response = handleFailAction(null, hFake, error);

    // then
    expect(pick(response, ['source', 'statusCode'])).deep.equal(expectedResponse);
  });
});
