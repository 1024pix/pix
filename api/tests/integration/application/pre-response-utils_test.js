import {
  BadRequestError,
  BaseHttpError,
  ConflictError,
  ForbiddenError,
  MissingQueryParamError,
  NotFoundError,
  PreconditionFailedError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../src/shared/application/http-errors.js';
import { handleDomainAndHttpErrors } from '../../../src/shared/application/pre-response-utils.js';
import { expect, hFake } from '../../test-helper.js';

describe('Integration | Application | PreResponse-utils', function () {
  describe('#handleDomainAndHttpErrors', function () {
    const successfulCases = [
      {
        should: 'should return HTTP code 400 when BadRequestError',
        response: new BadRequestError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'should return HTTP code 400 when MissingQueryParamError',
        response: new MissingQueryParamError('Error message'),
        expectedStatusCode: 400,
      },
      {
        should: 'should return HTTP code 401 when UnauthorizedError',
        response: new UnauthorizedError('Error message'),
        expectedStatusCode: 401,
      },
      {
        should: 'should return HTTP code 403 when ForbiddenError',
        response: new ForbiddenError('Error message'),
        expectedStatusCode: 403,
      },
      {
        should: 'should return HTTP code 404 when NotFoundError',
        response: new NotFoundError('Error message'),
        expectedStatusCode: 404,
      },
      {
        should: 'should return HTTP code 409 when ConflictError',
        response: new ConflictError('Error message'),
        expectedStatusCode: 409,
      },
      {
        should: 'should return HTTP code 412 when PreconditionFailedError',
        response: new PreconditionFailedError('Error message'),
        expectedStatusCode: 412,
      },
      {
        should: 'should return HTTP code 422 when UnprocessableEntityError',
        response: new UnprocessableEntityError('Error message'),
        expectedStatusCode: 422,
      },
      {
        should: 'should return HTTP code 400 when BaseHttpError',
        response: new BaseHttpError('Error message'),
        expectedStatusCode: 400,
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    successfulCases.forEach((testCase) => {
      it(testCase.should, async function () {
        // given
        const request = {
          response: testCase.response,
        };

        // when
        const response = await handleDomainAndHttpErrors(request, hFake);

        // then
        expect(response.statusCode).to.equal(testCase.expectedStatusCode);
      });
    });
  });
});
